import {
	ApplicationCommandOptionType,
	ChannelType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export const TicketCommand = {
	name: "ticket",
	description: "Manage the ticket system",
	options: [
		{
			name: "setup",
			description: "Configure the ticket system for this guild",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "category",
					description: "The category where ticket channels will be created",
					type: ApplicationCommandOptionType.Channel,
					channel_types: [ChannelType.GuildCategory],
					required: true,
				},
				{
					name: "support_role",
					description: "The role that will have access to all tickets",
					type: ApplicationCommandOptionType.Role,
					required: true,
				},
			],
		},
		{
			name: "panel",
			description: "Post a ticket panel with an Open Ticket button",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "channel",
					description: "The channel to post the panel in (defaults to current channel)",
					type: ApplicationCommandOptionType.Channel,
					channel_types: [ChannelType.GuildText],
					required: false,
				},
			],
		},
		{
			name: "view",
			description: "View current ticket configuration",
			type: ApplicationCommandOptionType.Subcommand,
		},
	],
	default_member_permissions: "0",
} as const satisfies RESTPostAPIApplicationCommandsJSONBody;
