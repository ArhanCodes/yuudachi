import {
	ApplicationCommandOptionType,
	InteractionContextType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export const SponsorCommand = {
	name: "role",
	description: "Add a role to a member of this guild",
	options: [
		{
			name: "user",
			description: "The user to give the role to",
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: "role",
			description: "The role to assign",
			type: ApplicationCommandOptionType.Role,
			required: true,
		},
	],
	default_member_permissions: "0",
	contexts: [InteractionContextType.Guild],
} as const satisfies RESTPostAPIApplicationCommandsJSONBody;
