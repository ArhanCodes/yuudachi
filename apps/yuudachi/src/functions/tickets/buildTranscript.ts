import type { Collection, Message } from "discord.js";

export function buildTranscript(channelName: string, messages: Collection<string, Message>): string {
	const sorted = [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);

	const header = [
		"TICKET TRANSCRIPT",
		`Channel: #${channelName}`,
		`Generated: ${new Date().toISOString()}`,
		"",
	].join("\n");

	const body = sorted
		.map((msg) => {
			const timestamp = msg.createdAt.toISOString();
			const author = `${msg.author.displayName} (${msg.author.tag})`;
			const content = msg.content.replaceAll("\n", "\\n") || "[no text content]";
			const attachments = msg.attachments.size > 0
				? ` [Attachments: ${[...msg.attachments.values()].map((a) => a.name).join(", ")}]`
				: "";
			return `[${timestamp}] ${author}: ${content}${attachments}`;
		})
		.join("\n");

	return header + body;
}
