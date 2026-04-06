import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { ApplicationCommandOptionType, ChannelType } from "discord-api-types/v10";
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

const TicketCommand = {
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
