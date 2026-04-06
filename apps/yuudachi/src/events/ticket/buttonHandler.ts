import { inject, injectable } from "@needle-di/core";
import { kSQL, container, logger } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Client,
	EmbedBuilder,
	Events,
	MessageFlags,
	OverwriteType,
	PermissionFlagsBits,
} from "discord.js";
import type { Sql } from "postgres";
import { Color } from "../../Constants.js";
import { buildTranscript } from "../../functions/tickets/buildTranscript.js";

@injectable()
export default class implements Event {
	public name = "Ticket button handling";

	public event = Events.InteractionCreate as const;

	public constructor(public readonly client: Client<true> = inject(Client)) {}

	public execute(): void {
		this.client.on(this.event, async (interaction) => {
			if (!interaction.isButton() || !interaction.customId.startsWith("ticket:")) {
				return;
			}

			if (!interaction.inCachedGuild()) {
				return;
			}

			const sql = container.get<Sql<any>>(kSQL);

			try {
				const action = interaction.customId.split(":")[1];

				if (action === "open") {
					await this.handleOpen(interaction, sql);
				} else if (action === "close") {
					const ticketId = Number.parseInt(interaction.customId.split(":")[2]!, 10);
					await this.handleClose(interaction, sql, ticketId);
				} else if (action === "transcript") {
					const ticketId = Number.parseInt(interaction.customId.split(":")[2]!, 10);
					await this.handleTranscript(interaction, sql, ticketId);
				}
			} catch (error) {
				const error_ = error as Error;
				logger.error(error_, error_.message);

				try {
					if (interaction.replied || interaction.deferred) {
						await interaction.editReply({ content: `An error occurred: ${error_.message}` });
					} else {
						await interaction.reply({ content: `An error occurred: ${error_.message}`, flags: MessageFlags.Ephemeral });
					}
				} catch {}
			}
		});
	}

	private async handleOpen(interaction: any, sql: Sql<any>): Promise<void> {
		const guildId = interaction.guildId!;

		const [config] = await sql<[{ category_id: string; support_role_id: string }?]>`
			select category_id, support_role_id
			from ticket_config
			where guild_id = ${guildId}
		`;

		if (!config?.category_id || !config?.support_role_id) {
			await interaction.reply({
				content: "The ticket system is not configured. Ask an admin to run `/ticket setup`.",
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		// Check if user already has an open ticket
		const [existingTicket] = await sql<[{ channel_id: string }?]>`
			select channel_id from tickets
			where guild_id = ${guildId} and opener_id = ${interaction.user.id} and status = 'open'
			limit 1
		`;

		if (existingTicket) {
			await interaction.reply({
				content: `You already have an open ticket: <#${existingTicket.channel_id}>`,
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		// Get next ticket number
		const [{ count }] = await sql<[{ count: number }]>`
			select count(*) from tickets where guild_id = ${guildId}
		`;

		const ticketNumber = Number(count) + 1;
		const channelName = `ticket-${String(ticketNumber).padStart(4, "0")}`;

		const guild = interaction.guild!;
		const channel = await guild.channels.create({
			name: channelName,
			type: ChannelType.GuildText,
			parent: config.category_id,
			permissionOverwrites: [
				{
					id: guild.id,
					type: OverwriteType.Role,
					deny: [PermissionFlagsBits.ViewChannel],
				},
				{
					id: interaction.user.id,
					type: OverwriteType.Member,
					allow: [
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.SendMessages,
						PermissionFlagsBits.ReadMessageHistory,
						PermissionFlagsBits.AttachFiles,
					],
				},
				{
					id: config.support_role_id,
					type: OverwriteType.Role,
					allow: [
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.SendMessages,
						PermissionFlagsBits.ReadMessageHistory,
						PermissionFlagsBits.AttachFiles,
						PermissionFlagsBits.ManageMessages,
					],
				},
			],
		});

		const [ticket] = await sql<[{ id: number }]>`
			insert into tickets (guild_id, channel_id, opener_id, status)
			values (${guildId}, ${channel.id}, ${interaction.user.id}, 'open')
			returning id
		`;

		const embed = new EmbedBuilder()
			.setColor(Color.DiscordPrimary)
			.setTitle(`Ticket #${ticketNumber}`)
			.setDescription(
				`Welcome <@${interaction.user.id}>!\n\nA member of our support team will be with you shortly. Please describe your issue in the meantime.`,
			)
			.setTimestamp();

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`ticket:close:${ticket.id}`)
				.setLabel("Close Ticket")
				.setStyle(ButtonStyle.Danger),
			new ButtonBuilder()
				.setCustomId(`ticket:transcript:${ticket.id}`)
				.setLabel("Save Transcript")
				.setStyle(ButtonStyle.Secondary),
		);

		await channel.send({ embeds: [embed], components: [row] });

		await interaction.reply({
			content: `Your ticket has been created: <#${channel.id}>`,
			flags: MessageFlags.Ephemeral,
		});
	}

	private async handleClose(interaction: any, sql: Sql<any>, ticketId: number): Promise<void> {
		const [ticket] = await sql<[{ channel_id: string; status: string }?]>`
			select channel_id, status from tickets where id = ${ticketId}
		`;

		if (!ticket) {
			await interaction.reply({ content: "Ticket not found.", flags: MessageFlags.Ephemeral });
			return;
		}

		if (ticket.status === "closed") {
			await interaction.reply({ content: "This ticket is already closed.", flags: MessageFlags.Ephemeral });
			return;
		}

		await sql`
			update tickets set status = 'closed', closed_at = now() where id = ${ticketId}
		`;

		await interaction.reply({ content: "Closing ticket..." });

		setTimeout(async () => {
			try {
				const channel = interaction.guild!.channels.cache.get(ticket.channel_id);
				if (channel) {
					await channel.delete("Ticket closed");
				}
			} catch (error) {
				logger.error(error as Error, "Failed to delete ticket channel");
			}
		}, 2_000);
	}

	private async handleTranscript(interaction: any, sql: Sql<any>, ticketId: number): Promise<void> {
		const [ticket] = await sql<[{ channel_id: string }?]>`
			select channel_id from tickets where id = ${ticketId}
		`;

		if (!ticket) {
			await interaction.reply({ content: "Ticket not found.", flags: MessageFlags.Ephemeral });
			return;
		}

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const channel = interaction.guild!.channels.cache.get(ticket.channel_id);
		if (!channel || !channel.isTextBased()) {
			await interaction.editReply({ content: "Could not access the ticket channel." });
			return;
		}

		const messages = await channel.messages.fetch({ limit: 100 });
		const transcript = buildTranscript(channel.name, messages);

		// Save transcript to database
		await sql`
			insert into ticket_transcripts (ticket_id, transcript)
			values (${ticketId}, ${transcript})
			on conflict (ticket_id)
			do update set transcript = ${transcript}
		`;

		const attachment = new AttachmentBuilder(Buffer.from(transcript, "utf-8"), {
			name: `ticket-${ticketId}-transcript.txt`,
		});

		await interaction.editReply({
			content: "Transcript saved and attached below.",
			files: [attachment],
		});
	}
}
