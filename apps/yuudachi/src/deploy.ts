import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import {
	// Moderation
	AntiRaidNukeCommand,
	CaseLookupCommand,
	BanCommand,
	DurationCommand,
	HistoryCommand,
	KickCommand,
	LockdownCommand,
	ReasonCommand,
	ReferenceCommand,
	SoftbanCommand,
	UnbanCommand,
	WarnCommand,
	TimeoutCommand,
	ClearCommand,
	ReportUtilsCommand,

	// Utility
	PingCommand,
	CheckScamCommand,
	RefreshScamlistCommand,
	SponsorCommand,
	ReportCommand,
	SettingsCommand,

	// Context Menu
	HistoryUserContextCommand,
	SponsorUserContextCommand,
	ClearContextCommand,
	ReportMessageContextCommand,
	ReportUserContextCommand,
} from "./interactions/index.js";

// Using raw numeric values because const enums from discord-api-types
// are not inlined by SWC, causing undefined values at runtime
const TicketCommand = {
	name: "ticket",
	description: "Manage the ticket system",
	options: [
		{
			name: "setup",
			description: "Configure the ticket system for this guild",
			type: 1, // Subcommand
			options: [
				{
					name: "category",
					description: "The category where ticket channels will be created",
					type: 7, // Channel
					channel_types: [4], // GuildCategory
					required: true,
				},
				{
					name: "support_role",
					description: "The role that will have access to all tickets",
					type: 8, // Role
					required: true,
				},
			],
		},
		{
			name: "panel",
			description: "Post a ticket panel with an Open Ticket button",
			type: 1, // Subcommand
			options: [
				{
					name: "channel",
					description: "The channel to post the panel in (defaults to current channel)",
					type: 7, // Channel
					channel_types: [0], // GuildText
					required: false,
				},
			],
		},
		{
			name: "view",
			description: "View current ticket configuration",
			type: 1, // Subcommand
		},
	],
	default_member_permissions: "0",
};

const PurgeCommand = {
	name: "purge",
	description: "Bulk delete messages with filters",
	options: [
		{
			name: "any",
			description: "Delete the last N messages in this channel",
			type: 1, // Subcommand
			options: [
				{
					name: "amount",
					description: "Number of messages to scan (1-100)",
					type: 4, // Integer
					required: true,
					min_value: 1,
					max_value: 100,
				},
			],
		},
		{
			name: "user",
			description: "Delete the last N messages from a specific user",
			type: 1,
			options: [
				{
					name: "user",
					description: "The user whose messages to delete",
					type: 6, // User
					required: true,
				},
				{
					name: "amount",
					description: "Number of messages to scan (1-100)",
					type: 4,
					required: true,
					min_value: 1,
					max_value: 100,
				},
			],
		},
		{
			name: "bots",
			description: "Delete bot messages from the last N messages",
			type: 1,
			options: [
				{
					name: "amount",
					description: "Number of messages to scan (1-100)",
					type: 4,
					required: true,
					min_value: 1,
					max_value: 100,
				},
			],
		},
		{
			name: "match",
			description: "Delete messages containing specific text",
			type: 1,
			options: [
				{
					name: "text",
					description: "Text the messages must contain (case-insensitive)",
					type: 3, // String
					required: true,
				},
				{
					name: "amount",
					description: "Number of messages to scan (1-100)",
					type: 4,
					required: true,
					min_value: 1,
					max_value: 100,
				},
			],
		},
		{
			name: "links",
			description: "Delete messages containing links",
			type: 1,
			options: [
				{
					name: "amount",
					description: "Number of messages to scan (1-100)",
					type: 4,
					required: true,
					min_value: 1,
					max_value: 100,
				},
			],
		},
		{
			name: "attachments",
			description: "Delete messages with attachments/embeds",
			type: 1,
			options: [
				{
					name: "amount",
					description: "Number of messages to scan (1-100)",
					type: 4,
					required: true,
					min_value: 1,
					max_value: 100,
				},
			],
		},
	],
	default_member_permissions: "0",
};

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

try {
	console.log("Start refreshing interaction (/) commands.");

	// Clear global commands (using guild commands only for instant updates)
	await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), {
		body: [],
	});

	await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!), {
		body: [
			// Moderation
			AntiRaidNukeCommand,
			BanCommand,
			CaseLookupCommand,
			DurationCommand,
			HistoryCommand,
			KickCommand,
			ReasonCommand,
			ReferenceCommand,
			SoftbanCommand,
			UnbanCommand,
			WarnCommand,
			LockdownCommand,
			TimeoutCommand,
			ClearCommand,
			PurgeCommand,
			ReportUtilsCommand,

			// Utility
			PingCommand,
			CheckScamCommand,
			RefreshScamlistCommand,
			SponsorCommand,
			ReportCommand,
			SettingsCommand,
			TicketCommand,

			// Context Menu
			HistoryUserContextCommand,
			SponsorUserContextCommand,
			ClearContextCommand,
			ReportMessageContextCommand,
			ReportUserContextCommand,
		],
	});

	console.log("Successfully reloaded interaction (/) commands.");
} catch (error) {
	console.error(error);
}
