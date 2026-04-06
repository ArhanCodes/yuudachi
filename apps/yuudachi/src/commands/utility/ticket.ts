import { injectable } from "@needle-di/core";
import { kSQL, Command, container } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	MessageFlags,
	type TextChannel,
} from "discord.js";
import type { Sql } from "postgres";
import { Color } from "../../Constants.js";
import type { TicketCommand } from "../../interactions/index.js";

@injectable()
export default class extends Command<typeof TicketCommand> {
	public constructor() {
		super(["ticket"]);
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof TicketCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const sql = container.get<Sql<any>>(kSQL);
		const guildId = interaction.guildId!;

		const subcommand = interaction.options.getSubcommand(true);

		if (subcommand === "setup") {
			const category = interaction.options.getChannel("category", true);
			const supportRole = interaction.options.getRole("support_role", true);

			await sql`
				insert into ticket_config (guild_id, category_id, support_role_id)
				values (${guildId}, ${category.id}, ${supportRole.id})
				on conflict (guild_id)
				do update set category_id = ${category.id}, support_role_id = ${supportRole.id}
			`;

			await interaction.reply({
				content: `Ticket system configured.\n**Category:** ${category.name}\n**Support Role:** <@&${supportRole.id}>`,
				flags: MessageFlags.Ephemeral,
			});
		} else if (subcommand === "panel") {
			const [config] = await sql<[{ category_id: string | null; support_role_id: string | null }?]>`
				select category_id, support_role_id
				from ticket_config
				where guild_id = ${guildId}
			`;

			if (!config?.category_id || !config?.support_role_id) {
				await interaction.reply({
					content: "Ticket system is not configured. Run `/ticket setup` first.",
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			const targetChannel = (interaction.options.getChannel("channel", false) ?? interaction.channel) as TextChannel;

			const embed = new EmbedBuilder()
				.setColor(Color.DiscordPrimary)
				.setTitle("Support Tickets")
				.setDescription(
					"Need help? Click the button below to open a private ticket channel.\n\nA member of our support team will be with you shortly.",
				);

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId("ticket:open")
					.setLabel("Open Ticket")
					.setStyle(ButtonStyle.Primary)
					.setEmoji("🎫"),
			);

			const panelMessage = await targetChannel.send({ embeds: [embed], components: [row] });

			await sql`
				update ticket_config
				set panel_channel_id = ${targetChannel.id}, panel_message_id = ${panelMessage.id}
				where guild_id = ${guildId}
			`;

			await interaction.reply({
				content: `Ticket panel posted in <#${targetChannel.id}>.`,
				flags: MessageFlags.Ephemeral,
			});
		} else if (subcommand === "view") {
			const [config] = await sql<
				[
					{
						category_id: string | null;
						panel_channel_id: string | null;
						panel_message_id: string | null;
						support_role_id: string | null;
					}?,
				]
			>`
				select category_id, support_role_id, panel_channel_id, panel_message_id
				from ticket_config
				where guild_id = ${guildId}
			`;

			if (!config) {
				await interaction.reply({
					content: "Ticket system is not configured. Run `/ticket setup` first.",
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			const [{ count }] = await sql<[{ count: number }]>`
				select count(*) from tickets where guild_id = ${guildId} and status = 'open'
			`;

			const lines = [
				`**Category:** ${config.category_id ? `<#${config.category_id}>` : "Not set"}`,
				`**Support Role:** ${config.support_role_id ? `<@&${config.support_role_id}>` : "Not set"}`,
				`**Panel Channel:** ${config.panel_channel_id ? `<#${config.panel_channel_id}>` : "Not posted"}`,
				`**Open Tickets:** ${count}`,
			];

			await interaction.reply({
				content: lines.join("\n"),
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}
