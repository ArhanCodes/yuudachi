import { injectable } from "@needle-di/core";
import { Command, createButton, createMessageActionRow } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam, CommandMethod } from "@yuudachi/framework/types";
import { ButtonStyle, ComponentType, MessageFlags } from "discord.js";
import { nanoid } from "nanoid";
import type { SponsorCommand, SponsorUserContextCommand } from "../../interactions/index.js";

@injectable()
export default class extends Command<typeof SponsorCommand | typeof SponsorUserContextCommand> {
	public constructor() {
		super(["role", "Assign role"]);
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof SponsorCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const reply = await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const targetMember = interaction.options.getMember("user");
		const targetUser = interaction.options.getUser("user", true);
		const role = interaction.options.getRole("role", true);

		if (!targetMember) {
			await interaction.editReply({ content: "Could not find that member." });
			return;
		}

		if ("cache" in targetMember.roles && targetMember.roles.cache.has(role.id)) {
			await interaction.editReply({
				content: `${targetUser.toString()} already has the **${role.name}** role.`,
			});
			return;
		}

		const confirmKey = nanoid();
		const cancelKey = nanoid();

		const confirmButton = createButton({
			label: "Confirm",
			customId: confirmKey,
			style: ButtonStyle.Success,
		});
		const cancelButton = createButton({
			label: "Cancel",
			customId: cancelKey,
			style: ButtonStyle.Secondary,
		});

		await interaction.editReply({
			content: `Add the **${role.name}** role to ${targetUser.toString()} (${targetUser.tag} - ${targetUser.id})?`,
			components: [createMessageActionRow([cancelButton, confirmButton])],
		});

		const collectedInteraction = await reply
			.awaitMessageComponent({
				filter: (collected) => collected.user.id === interaction.user.id,
				componentType: ComponentType.Button,
				time: 15_000,
			})
			.catch(async () => {
				try {
					await interaction.editReply({
						content: "Timed out.",
						components: [],
					});
				} catch {}

				return undefined;
			});

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: `Cancelled adding **${role.name}** to ${targetUser.toString()}.`,
				components: [],
			});
		} else if (collectedInteraction?.customId === confirmKey) {
			await collectedInteraction.deferUpdate();

			if ("add" in targetMember.roles) {
				await targetMember.roles.add(role.id, `Role assigned by ${interaction.user.tag}`);
			}

			await collectedInteraction.editReply({
				content: `Successfully added **${role.name}** to ${targetUser.toString()}.`,
				components: [],
			});
		}
	}

	public override async userContext(
		interaction: InteractionParam<CommandMethod.UserContext>,
		args: ArgsParam<typeof SponsorUserContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.reply({
			content: "Use the `/role` slash command to assign a role.",
			flags: MessageFlags.Ephemeral,
		});
	}
}
