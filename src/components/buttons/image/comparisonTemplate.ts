import { Component } from "@interfaces/components";
import { info } from "@helpers/logger";
import { Client, ButtonInteraction, EmbedBuilder } from "@client";
import { magnifyToAttachment } from "@images/magnify";
import { parseDisplay } from "@functions/textureComparison";
import formatName from "@utility/formatName";
import { loadImage } from "@napi-rs/canvas";
import stitch from "@helpers/images/stitch";

export default {
	id: "comparisonTemplate",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Comparison template requested!`);
		await interaction.deferReply({ ephemeral: true });

		const message = interaction.message;
		const display = message.embeds[0].footer.text.split(":")[1].trim();
		const packs = parseDisplay(display);

		const loadedImages = [];
		for (const packSet of packs) {
			loadedImages.push([]);
			for (const pack of packSet)
				loadedImages.at(-1).push(await loadImage(formatName(pack, "64")[1]));
		}

		const stitched = await stitch(loadedImages);
		const magnified = await magnifyToAttachment(stitched);

		const embed = new EmbedBuilder()
			.setImage("attachment://magnified.png")
			.setTitle(`Comparison Template`);

		return await interaction.editReply({
			embeds: [embed],
			files: [magnified],
		});
	},
} as Component;
