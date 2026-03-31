import { injectable } from "@needle-di/core";
import { kSQL, Command, container } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import { MessageFlags } from "discord.js";
import type { Sql } from "postgres";
import type { SettingsCommand } from "../../interactions/index.js";

@injectable()
export default class extends Command<typeof SettingsCommand> {
	public constructor() {
		super(["settings"]);
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof SettingsCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const sql = container.get<Sql<any>>(kSQL);
		const guildId = interaction.guildId!;

		const subcommand = interaction.options.getSubcommand(true);

		if (subcommand === "mod-log") {
			const channel = interaction.options.getChannel("channel", true);

			await sql`
				insert into guild_settings (guild_id, mod_log_channel_id)
				values (${guildId}, ${channel.id})
				on conflict (guild_id)
				do update set mod_log_channel_id = ${channel.id}
			`;

			await interaction.reply({
				content: `Mod log channel set to <#${channel.id}>.`,
				flags: MessageFlags.Ephemeral,
			});
		} else if (subcommand === "mod-role") {
			const role = interaction.options.getRole("role", true);

			await sql`
				insert into guild_settings (guild_id, mod_role_id)
				values (${guildId}, ${role.id})
				on conflict (guild_id)
				do update set mod_role_id = ${role.id}
			`;

			await interaction.reply({
				content: `Mod role set to <@&${role.id}>.`,
				flags: MessageFlags.Ephemeral,
			});
		} else if (subcommand === "report-channel") {
			const channel = interaction.options.getChannel("channel", true);

			await sql`
				insert into guild_settings (guild_id, report_channel_id)
				values (${guildId}, ${channel.id})
				on conflict (guild_id)
				do update set report_channel_id = ${channel.id}
			`;

			await interaction.reply({
				content: `Report channel set to <#${channel.id}>.`,
				flags: MessageFlags.Ephemeral,
			});
		} else if (subcommand === "view") {
			const [settings] = await sql<[{ mod_log_channel_id: string | null; mod_role_id: string | null; report_channel_id: string | null }?]>`
				select mod_log_channel_id, mod_role_id, report_channel_id
				from guild_settings
				where guild_id = ${guildId}
			`;

			if (!settings) {
				await interaction.reply({
					content: "No settings configured yet. Use `/settings mod-log`, `/settings mod-role`, and `/settings report-channel` to get started.",
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			const lines = [
				`**Mod Log Channel:** ${settings.mod_log_channel_id ? `<#${settings.mod_log_channel_id}>` : "Not set"}`,
				`**Mod Role:** ${settings.mod_role_id ? `<@&${settings.mod_role_id}>` : "Not set"}`,
				`**Report Channel:** ${settings.report_channel_id ? `<#${settings.report_channel_id}>` : "Not set"}`,
			];

			await interaction.reply({
				content: lines.join("\n"),
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}
