import { Event } from "@interfaces";
import { Client, Message, MessageEmbed } from "@client";
import easterEgg from "@functions/canvas/isEasterEggImg";
import { getSubmissionsChannels } from "@helpers/channels";
import { Paths, Uses } from "@helpers/interfaces/firestorm";
import axios from 'axios';
import { AddPathsToEmbed } from "@helpers/sorter";

export const event: Event = {
	name: "messageCreate",
	run: async (client: Client, message: Message) => {
		//! do not remove, 'force' message to be casted (break if removed)
		let _ = (message as Message) instanceof Message;

		let m = Object.assign({}, message); // lose reference to message: create unique instance of the message for the logger (ask @Juknum)
		m.isDeleted = false;
		client.storeAction("message", m);

		if (message.author.bot) return;

		// test if message is in submit channel
		if (getSubmissionsChannels(client as Client).includes(message.channelId)) {
			client.emit("textureSubmitted", (client as Client, message));
			return;
		}

		switch (message.content.toLocaleLowerCase()) {
			case "engineer gaming":
				try {
					await message.react("👷");
				} catch (err) {
					/* can't react */
				}
				break;
			case "rip":
			case "f":
				try {
					await message.react("🇫");
				} catch (err) {
					/* can't react */
				}
				break;
			case "band":
				["🎤", "🎸", "🥁", "🪘", "🎺", "🎷", "🎹", "🪗", "🎻"].forEach(async (emoji) => {
					try {
						await message.react(emoji);
					} catch (err) {
						/* can't react */
					}
				});
				break;
			case "monke":
			case "monkee":
			case "monkey":
				["🎷", "🐒"].forEach(async (emoji) => {
					try {
						await message.react(emoji);
					} catch (err) {
						/* can't react */
					}
				});
				break;
			case "mhhh":
				const mhhhEmbed = new MessageEmbed()
					.setDescription("```Uh-oh moment```")
					.setFooter({ text: "Swahili → English" });
				message.reply({ embeds: [mhhhEmbed] }).then((message) => message.deleteButton(true));
				break;
			case "hello there":
				const helloEmbed = new MessageEmbed()
				if (Math.floor(Math.random() * 5) != 1) { // copy and pasted the rng from the old js bot, might need some tweaks idk
					helloEmbed.setImage("https://media1.tenor.com/images/8dc53503f5a5bb23ef12b2c83a0e1d4d/tenor.gif");
				} else { // secret response :eyes:
					helloEmbed.setImage("https://i.imgur.com/hAuUsnD.png")
				}
				message
					.reply({ embeds: [helloEmbed] })
					.then((message) => message.deleteButton(true));
				break;
		}
		if (message.content.includes("(╯°□°）╯︵ ┻━┻"))
			return await message.reply({ content: "┬─┬ ノ( ゜-゜ノ) calm down bro" });

		const textureID = [...message.content.matchAll(/(?<=\[\#)(.*?)(?=\])/g)] ?? [];
		for (let i of textureID) {
			if (+i[0] > 0) { // cast to number
				try {
					const results = (await axios.get(`${(client as Client).config.apiUrl}textures/${i[0]}/all`)).data;
					const embed = new MessageEmbed()
						.setTitle(`[#${i[0]}] ${results.name}`)
						.setDescription(`[View texture online](https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${i[0]})`)
						.addFields(AddPathsToEmbed(results))

					message.reply({ embeds: [embed] }).then(message => message.deleteButton(true));
				} catch {/* texture doesn't exist */}
			}
		}

		if (message.attachments.size > 0) {
			if ((await easterEgg(message.attachments.first().url, 1)) && !client.tokens.dev) {
				const embed = new MessageEmbed()
					.setTitle('"rOtAte tiLinG"')
					.setImage("https://cdn.discordapp.com/attachments/923370825762078720/939476550749913138/tiled.png")
					.setFooter({ text: "Nick.#1666" })
					.setTimestamp(new Date(1644059063305)); // when the funny moment happened
				message.reply({ embeds: [embed] }).then((message) => message.deleteButton(true));
			}

			if ((await easterEgg(message.attachments.first().url, 2)) && !client.tokens.dev) {
				const embed = new MessageEmbed()
					.setTitle('"FlIp tiLinG"')
					.setImage("https://cdn.discordapp.com/attachments/923370825762078720/940676536330223676/tiled.png")
					.setFooter({ text: "Nick.#1666 - again" })
					.setTimestamp(new Date(1644345162257)); // when the funny moment happened again
				message.reply({ embeds: [embed] }).then((message) => message.deleteButton(true));
			}
		}
	},
};
