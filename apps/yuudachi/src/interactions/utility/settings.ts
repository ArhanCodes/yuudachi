import {
	ApplicationCommandOptionType,
	ChannelType,
	InteractionContextType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export const SettingsCommand = {
	name: "settings",
	description: "Configure guild settings",
	options: [
		{
			name: "mod-log",
			description: "Set the moderation log channel",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "channel",
					description: "The channel for mod logs",
					type: ApplicationCommandOptionType.Channel,
					channel_types: [ChannelType.GuildText],
					required: true,
				},
			],
		},
		{
			name: "mod-role",
			description: "Set the moderator role",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "role",
					description: "The moderator role",
					type: ApplicationCommandOptionType.Role,
					required: true,
				},
			],
		},
		{
			name: "view",
			description: "View current guild settings",
			type: ApplicationCommandOptionType.Subcommand,
		},
	],
	default_member_permissions: "0",
	contexts: [InteractionContextType.Guild],
} as const satisfies RESTPostAPIApplicationCommandsJSONBody;
