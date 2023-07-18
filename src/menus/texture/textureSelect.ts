import { Client, Message, SelectMenuInteraction } from "@client";
import { SelectMenu } from "@interfaces";
import { info } from "@helpers/logger";
import { textureButtons } from "@helpers/buttons";
import { MessageInteraction } from "discord.js";
import { getTextureMessageOptions } from "@functions/getTexture";
import axios from "axios";

export const menu: SelectMenu = {
	selectMenuId: "textureSelect",
	execute: async (client: Client, interaction: SelectMenuInteraction) => {
		if (client.verbose) console.log(`${info}Texture selected!`);

		const messageInteraction: MessageInteraction = interaction.message
			.interaction as MessageInteraction;
		const message: Message = interaction.message as Message;

		if (interaction.user.id !== messageInteraction.user.id)
			return interaction.reply({
				content: (
					await interaction.getEphemeralString({ string: "Error.Interaction.Reserved" })
				).replace("%USER%", `<@!${messageInteraction.user.id}>`),
				ephemeral: true,
			});
		else interaction.deferReply();

		const [id, pack] = interaction.values[0].split("__");
		const replyOptions = await getTextureMessageOptions({
			texture: (
				await axios.get(`${(interaction.client as Client).tokens.apiUrl}textures/${id}/all`)
			).data,
			pack: pack,
			guild: interaction.guild,
		});

		replyOptions.embeds[0].setFooter({
			text: `${replyOptions.embeds[0].footer.text} | ${interaction.user.id}`,
			iconURL: replyOptions.embeds[0].footer.iconURL,
		});

		try {
			message.delete();
		} catch (err) {
			interaction.editReply({
				content: await interaction.getEphemeralString({ string: "Error.Message.Deleted" }),
			});
		}

		interaction
			.editReply(replyOptions)
			.then((message: Message) => message.deleteButton(true));
	},
};
