import {
	ApplicationCommandOptionType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export const PurgeCommand = {
	name: "purge",
	description: "Bulk delete messages with filters",
	options: [
		{
			name: "any",
			description: "Delete the last N messages in this channel",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "amount",
					description: "Number of messages to scan (1-100)",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					min_value: 1,
					max_value: 100,
				},
			],
		},
		{
			name: "user",
			description: "Delete the last N messages from a specific user",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					description: "The user whose messages to delete",
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: "amount",
					description: "Number of messages to scan (1-100)",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					min_value: 1,
					max_value: 100,
				},
			],
		},
		{
			name: "bots",
			description: "Delete bot messages from the last N messages",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "amount",
					description: "Number of messages to scan (1-100)",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					min_value: 1,
					max_value: 100,
				},
			],
		},
		{
			name: "match",
			description: "Delete messages containing specific text",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "text",
					description: "Text the messages must contain (case-insensitive)",
					type: ApplicationCommandOptionType.String,
					required: true,
				},
				{
					name: "amount",
					description: "Number of messages to scan (1-100)",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					min_value: 1,
					max_value: 100,
				},
			],
		},
		{
			name: "links",
			description: "Delete messages containing links",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "amount",
					description: "Number of messages to scan (1-100)",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					min_value: 1,
					max_value: 100,
				},
			],
		},
		{
			name: "attachments",
			description: "Delete messages with attachments/embeds",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "amount",
					description: "Number of messages to scan (1-100)",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					min_value: 1,
					max_value: 100,
				},
			],
		},
	],
	default_member_permissions: "0",
} as const satisfies RESTPostAPIApplicationCommandsJSONBody;
