import { Command } from '~/Interfaces';
import { magnifyAttachment } from '~/Functions/canvas/magnify';
import { paletteEmbed } from '~/Functions/canvas/palette';

export const command: Command = {
	name: 'palette',
	description: 'Shows colours of an image.',
	usage: ['palette (image attachment|reply to message with image attachment)', 'palette (image url)'],
	aliases: ['p', 'colors', 'colours'],
	run: async (client, message, args) => {
		let attach: string;

		if (message.type == 'REPLY' && message.channel.type == 'GUILD_TEXT') {
			const reply = await message.channel.messages.fetch(message.reference.messageId);

			if (reply.attachments.size > 0)
				attach = reply.attachments.first().url;
			else if (reply.embeds[0].image)
				attach = reply.embeds[0].image.url;
			else if (reply.embeds[0].thumbnail)
				attach = reply.embeds[0].thumbnail.url;

			else return message.warn('This reply doesn\'t have any image attached!');
		}

		if (args.length != 0) attach = args[0];
		if (message.attachments.size == 1) attach = message.attachments.first().url;

		if (attach == undefined) {
			let messages = await message.channel.messages.fetch({ limit: 10 });

			//gets last message with at least one attachment
			const lastMessage = messages
				.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
				.filter((m) => m.attachments.size > 0 || m.embeds[0] != undefined)
				.first();

			/**
			 * bacically checks if the attachment url ends with an image extension
			 * explanation:
			 * wierd regex trolling, returns true if it contains .jpeg, .jpg, .png or .webp and a string termination ($)
			 */
			if (lastMessage == undefined) return message.warn('Nothing to magnify in the last 10 messages!');
			if (lastMessage.attachments.size > 0 && lastMessage.attachments.first().url.match(/\.(jpeg|jpg|png|webp)$/))
				attach = lastMessage.attachments.first().url;
			else if (lastMessage.embeds[0].image)
				attach = lastMessage.embeds[0].image.url;
			else if (lastMessage.embeds[0].thumbnail)
				attach = lastMessage.embeds[0].thumbnail.url;
		}

		if (attach != undefined) {
			message.reply({ embeds: [await paletteEmbed(attach, 'BLURPLE')] })
				.then((res) => res.deleteReact({ authorMessage: message, deleteAuthorMessage: true }))
				.catch(() => {
					message.warn('Output exeeds the maximum of 512 x 512px²!');
				});
		} else message.warn('Nothing to palette in the last 10 messages!');
	},
};