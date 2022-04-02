import { pollDelete, pollVotes, pollYesNo } from "@helpers/buttons";
import { Client, CommandInteraction, Message, MessageEmbed } from "@client";
import { MessageActionRow, MessageButton, TextChannel, EmbedField } from "discord.js";
import { TimedEmbed } from "./timedEmbed";

export interface PollOptions {
	question: string;
	yesno: boolean;
	answersArr: Array<string>;
	thread: boolean
}
export class Poll extends TimedEmbed {
	constructor(data?: Poll) {
		super(data);
	}

	/**
	 * Update the discord message with the poll embed
	 * @param {Client} client - Discord Client
	 * @returns {Promise<void>}
	 */
	public async updateEmbed(client: Client): Promise<void> {
		let channel: TextChannel;
		let message: Message;

		try {
			channel = (await client.channels.fetch(this.getChannelId())) as any;
			message = await channel.messages.fetch(this.getMessageId());
		} catch {
			// message or channel can't be fetched
			return;
		}

		const embed: MessageEmbed = new MessageEmbed(message.embeds[0]);
		let components: Array<MessageActionRow> = message.components;

		if (this.getStatus() === "ended") components = [];
		embed.fields = embed.fields.map((field: EmbedField, index: number) => {
			if (index === 0) return field;
			if (field.name === "Timeout") {
				if (this.getStatus() === "ended") field.value = "Ended";
				return field;
			}

			const votesCount: Array<number> = this.getVotesCount();
			const votes: Array<Array<string>> = this.getVotes();

			field.value =
				votesCount[index - 1] === 0
					? (this.getStatus() === "ended" ? "Nobody has voted." : "No votes yet.")
					: `> ${votesCount[index - 1]} / ${votesCount.reduce((partialSum, a) => partialSum + a, 0)} (${(
							(votesCount[index - 1] / votesCount.reduce((partialSum, a) => partialSum + a, 0)) *
							100
					  ).toFixed(2)}%)`;

			if (this.isAnonymous() === false)
				field.value +=
					votes[index - 1] && votes[index - 1].length > 0 ? `\n<@!${votes[index - 1].join(">, <@!")}>` : "";

			return field;
		});

		await message.edit({ embeds: [embed], components: [...components] });
		return;
	}

	/**
	 * Post the poll message to the channel
	 * @param {CommandInteraction} interaction - command interaction from where the poll is issued
	 * @param {MessageEmbed} embed - the poll embed that will be posted in the message
	 * @param {PollOptions} options - different options for the poll
	 * @returns {Promise<void>}
	 */
	public async postSubmissionMessage(
		interaction: CommandInteraction,
		embed: MessageEmbed,
		options: PollOptions,
	): Promise<void> {
		embed.setTitle(options.question);
		embed.setFooter({ text: `${this.id} | ${embed.footer.text}` });
		embed.addFields(
			options.answersArr.map((answer: string, index: number) => {
				return { name: `${answer}`, value: `No votes yet.` };
			}),
		);

		// votes options setup
		if (options.yesno) {
			this.setVotes({ upvote: [], downvote: [] });
		} else {
			let tmp = {};
			for (let i = 0; i < options.answersArr.length; i++) tmp[i] = [];
			this.setVotes(tmp);
		}

		if (this.getTimeout() !== 0) embed.addField("Timeout", `<t:${this.getTimeout()}:R>`, true);

		const components: Array<MessageActionRow> = [];
		if (options.yesno) components.push(pollYesNo);
		else {
			const btns: Array<MessageButton> = [];
			options.answersArr.forEach((el, index) => btns.push(pollVotes[index]));
			components.push(new MessageActionRow().addComponents(btns));
		}

		const message: Message = (await interaction.editReply({
			embeds: [embed],
			components: [...components, new MessageActionRow().addComponents(pollDelete)],
		})) as any;

		if (options.thread) {
			message.startThread({name: `Debate: ${options.question}`})
		}

		this.setChannelId(interaction.channelId);
		this.setMessageId(message.id);

		(interaction.client as Client).polls.set(this.id, this);
	}
}
