import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageEmbed } from "@client";
import { getTextureMessageOptions } from "@functions/getTexture";
import { MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import { textureButtons } from "@helpers/buttons";
import { minecraftSorter } from "@helpers/sorter";
import parseTextureName from "@functions/parseTextureName";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("texture")
		.setDescription("Displays a specified texture from either vanilla Minecraft or Faithful.")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("Name or ID of the texture you are searching for.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("pack")
				.setDescription("Resource pack of the texture you are searching for.")
				.addChoices(
					{ name: "Default Jappa", value: "default" },
					{ name: "Default Programmer Art", value: "progart" },
					{ name: "Faithful 32x", value: "faithful_32x" },
					{ name: "Faithful 64x", value: "faithful_64x" },
					{ name: "Classic Faithful 32x Jappa", value: "classic_faithful_32x" },
					{ name: "Classic Faithful 32x Programmer Art", value: "classic_faithful_32x_progart" },
					{ name: "Classic Faithful 64x", value: "classic_faithful_64x" },
				)
				.setRequired(true),
		),
	execute: async (interaction: CommandInteraction) => {
		var name = interaction.options.getString("name");
		const results = await parseTextureName(name, interaction);

		// returned early in parseTextureName()
		if (!results) return;

		if (!results.length) {
			// no results
			return interaction.reply({
				content: await interaction.getEphemeralString({
					string: "Command.Texture.NotFound",
					placeholders: { TEXTURENAME: `\`${name}\`` },
				}),
				ephemeral: true,
			});
		}

		await interaction.deferReply();

		// only 1 result
		if (results.length === 1) {
			const replyOptions = await getTextureMessageOptions({
				texture: results[0],
				pack: interaction.options.getString("pack", true),
				guild: interaction.guild,
			});
			return interaction.editReply(replyOptions).then((message: Message) => message.deleteButton());
		}

		// multiple results
		const components: Array<MessageActionRow> = [];
		let rlen: number = results.length;
		let max: number = 4; // actually 5 but - 1 because we are adding a delete button to it (the 5th one)
		let _max: number = 0;

		// parsing everything correctly
		for (let i = 0; i < results.length; i++) {
			results[i] = {
				label: `[#${results[i].id}] (${
					results[i].paths[0].versions.sort(minecraftSorter).reverse()[0]
				}) ${results[i].name}`,
				description: results[i].paths[0].name,
				value: `${results[i].id}__${interaction.options.getString("pack", true)}`,
			};
		}

		const emojis: Array<string> = [
			"1️⃣",
			"2️⃣",
			"3️⃣",
			"4️⃣",
			"5️⃣",
			"6️⃣",
			"7️⃣",
			"8️⃣",
			"9️⃣",
			"🔟",
			"🇦",
			"🇧",
			"🇨",
			"🇩",
			"🇪",
			"🇫",
			"🇬",
			"🇭",
			"🇮",
			"🇯",
			"🇰",
			"🇱",
			"🇲",
			"🇳",
			"🇴",
		];

		// dividing into maximum of 25 choices per menu
		// 4 menus max
		do {
			const options: Array<MessageSelectOptionData> = [];

			for (let i = 0; i < 25; i++)
				// if (results[0] !== undefined) options.push(results.shift());
				if (results[0] !== undefined) {
					let t = results.shift();
					t.emoji = emojis[i % emojis.length];
					options.push(t);
				}

			const menu = new MessageSelectMenu()
				.setCustomId(`textureSelect_${_max}`)
				.setPlaceholder("Select a texture!")
				.addOptions(options);

			const row = new MessageActionRow().addComponents(menu);

			components.push(row);
		} while (results.length !== 0 && _max++ < max);

		const embed = new MessageEmbed()
			.setTitle(`${rlen} results found`)
			.setDescription(`If you can't what you're looking for, please be more specific!`);

		await interaction
			.editReply({ embeds: [embed], components: components })
			.then((message: Message) => message.deleteButton());
	},
};
