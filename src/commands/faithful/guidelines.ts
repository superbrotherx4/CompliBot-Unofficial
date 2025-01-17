import { SlashCommand } from "@interfaces/commands";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, Message, EmbedBuilder } from "@client";
import guidelineJSON from "@json/guidelines.json";
import { colors } from "@utility/colors";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("guidelines")
		.setDescription("Shows various Faithful texturing guidelines.")
		.addStringOption((option) =>
			option
				.setName("pack")
				.setDescription("The guidelines you want to view")
				.addChoices(
					{ name: "Faithful 32x", value: "faithful_32x" },
					{ name: "Faithful 64x", value: "faithful_64x" },
					{ name: "Classic Faithful 32x", value: "classic_faithful_32x" },
				)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("choice")
				.setDescription("A specific part of the guidelines you want to link to")
				.setRequired(false),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		let content: string;
		const keyword = interaction.options.getString("choice")?.toLocaleLowerCase();
		const pack = interaction.options.getString("pack");
		const errorEmbed = new EmbedBuilder()
			.setTitle("Invalid choice!")
			.setDescription(
				`\`${keyword}\` is not a valid choice for pack \`${pack}\`. Have you chosen the wrong pack or made a typo?`,
			)
			.setColor(colors.red);

		switch (pack) {
			case "faithful_32x":
				content = "https://docs.faithfulpack.net/pages/textures/f32-texturing-guidelines";
				break;
			case "faithful_64x":
				content = "https://docs.faithfulpack.net/pages/textures/f64-texturing-guidelines";
				break;
			case "classic_faithful_32x":
				content = "https://docs.faithfulpack.net/pages/textures/cf32-texturing-guidelines";
				break;
		}

		if (keyword) {
			if (
				!guidelineJSON
					.map((i) => i.keywords)
					.flat()
					.includes(keyword)
			) {
				// if it's not present anywhere escape early
				return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
			}

			for (const choice of guidelineJSON) {
				if (!choice.keywords.includes(keyword)) continue;
				if (!choice[pack]) {
					// if you pick an option that isn't present in the pack you selected
					return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
				}
				content += `#${choice[pack]}`; // adds the html id specified in the json
				break;
			}
		}
		interaction
			.reply({ content, fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
