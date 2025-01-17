import { Component } from "@interfaces/components";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, EmbedBuilder } from "@client";
import { tileToAttachment } from "@images/tile";
import { imageButtons } from "@utility/buttons";
import getImage, { imageNotFound } from "@helpers/getImage";
import { imageTooBig } from "@helpers/warnUser";

export default {
	id: "tile",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Image was tiled!`);

		const message = interaction.message;
		const url = await getImage(message);
		if (!url) return imageNotFound(interaction);
		const attachment = await tileToAttachment(url);

		if (!attachment) return await imageTooBig(interaction, "tile");

		return interaction
			.reply({
				embeds: [
					new EmbedBuilder()
						.setImage(`attachment://${attachment.name}`)
						.setFooter({ text: `${interaction.user.username} | ${interaction.user.id}` })
						.setTimestamp(),
				],
				files: [attachment],
				components: [imageButtons],
				fetchReply: true,
			})
			.then((message: Message) => {
				message.deleteButton(true);
			});
	},
} as Component;
