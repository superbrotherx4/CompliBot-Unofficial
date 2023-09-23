import { SlashCommand } from "@interfaces";
import { Client, ChatInputCommandInteraction, Message, EmbedBuilder } from "@client";
import { SlashCommandBuilder } from "@discordjs/builders";
import { generalSlashCommandImage } from "@functions/slashCommandImage";
import { mcColorsOptions, multiplyAttachment } from "@images/multiply";
export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("tint")
		.setDescription(`Tint a grayscale image to a minecraft color`)
		.addStringOption((option) =>
			option
				.setName("color")
				.setDescription("The color to tint the grayscale image to")
				.addChoices(...mcColorsOptions)
				.setRequired(true),
		)
		.addAttachmentOption((o) =>
			o.setName("image").setDescription("The image to tint").setRequired(false),
		),
	execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
		generalSlashCommandImage(interaction, multiplyAttachment, {
			color: interaction.options.getString("color"),
			name: "tinted.png",
			embed: new EmbedBuilder().setTitle("Tinted").setImage("attachment://tinted.png"),
		});
	},
};
