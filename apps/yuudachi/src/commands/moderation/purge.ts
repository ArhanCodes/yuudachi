import { injectable } from "@needle-di/core";
import { Command } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import { ChannelType, type Collection, type Message, MessageFlags, type TextChannel } from "discord.js";
import type { PurgeCommand } from "../../interactions/index.js";

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1_000;
const URL_REGEX = /https?:\/\/[^\s]+/i;

@injectable()
export default class extends Command<typeof PurgeCommand> {
	public constructor() {
		super(["purge"]);
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof PurgeCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const channel = interaction.channel;
		if (!channel || channel.type !== ChannelType.GuildText) {
			await interaction.editReply({ content: "This command can only be used in text channels." });
			return;
		}

		const subcommand = interaction.options.getSubcommand(true);
		const amount = interaction.options.getInteger("amount", true);

		// Fetch the most recent N messages from the channel
		const fetched = await (channel as TextChannel).messages.fetch({ limit: amount });

		// Filter based on subcommand
		const now = Date.now();
		const filtered = fetched.filter((msg) => {
			// Skip messages older than 14 days (Discord bulkDelete limit)
			if (now - msg.createdTimestamp >= TWO_WEEKS_MS) return false;
			// Skip pinned messages so we don't nuke important ones
			if (msg.pinned) return false;

			if (subcommand === "any") return true;

			if (subcommand === "user") {
				const user = interaction.options.getUser("user", true);
				return msg.author.id === user.id;
			}

			if (subcommand === "bots") {
				return msg.author.bot;
			}

			if (subcommand === "match") {
				const text = interaction.options.getString("text", true).toLowerCase();
				return msg.content.toLowerCase().includes(text);
			}

			if (subcommand === "links") {
				return URL_REGEX.test(msg.content);
			}

			if (subcommand === "attachments") {
				return msg.attachments.size > 0 || msg.embeds.length > 0 || msg.stickers.size > 0;
			}

			return false;
		}) as Collection<string, Message>;

		if (filtered.size === 0) {
			await interaction.editReply({ content: "No matching messages found in the last " + amount + " messages." });
			return;
		}

		try {
			const deleted = await (channel as TextChannel).bulkDelete(filtered, true);
			const skipped = filtered.size - deleted.size;
			const skippedNote = skipped > 0 ? ` (${skipped} skipped — too old)` : "";
			await interaction.editReply({
				content: `Deleted ${deleted.size} message${deleted.size === 1 ? "" : "s"}${skippedNote}.`,
			});
		} catch (error) {
			const error_ = error as Error;
			await interaction.editReply({ content: `Failed to delete messages: ${error_.message}` });
		}
	}
}
