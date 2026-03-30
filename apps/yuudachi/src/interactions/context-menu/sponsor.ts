import {
	ApplicationCommandType,
	InteractionContextType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export const SponsorUserContextCommand = {
	name: "Assign role",
	type: ApplicationCommandType.User,
	default_member_permissions: "0",
	contexts: [InteractionContextType.Guild],
} as const satisfies RESTPostAPIApplicationCommandsJSONBody;
