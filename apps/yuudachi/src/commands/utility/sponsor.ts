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

		const role = args.role;
		const targetUser = args.user;

		if (targetUser.member?.roles.cache.has(role.role!.id)) {
			await interaction.editReply({
				content: `${targetUser.user.toString()} already has the ${role.role!.name} role.`,
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
			content: `Add the **${role.role!.name}** role to ${targetUser.user.toString()} (${targetUser.user.tag} - ${targetUser.user.id})?`,
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
				content: `Cancelled adding **${role.role!.name}** to ${targetUser.user.toString()}.`,
				components: [],
			});
		} else if (collectedInteraction?.customId === confirmKey) {
			await collectedInteraction.deferUpdate();

			await targetUser.member?.roles.add(role.role!.id, `Role assigned by ${interaction.user.tag}`);

			await collectedInteraction.editReply({
				content: `Successfully added **${role.role!.name}** to ${targetUser.user.toString()}.`,
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
