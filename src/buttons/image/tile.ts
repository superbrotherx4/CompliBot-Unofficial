import { Button } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@client";
import { tileAttachment } from "@functions/canvas/tile";
import { imageButtons } from "@helpers/buttons";
import { getImageFromMessage } from "@functions/slashCommandImage";

export const button: Button = {
	buttonId: "tile",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Image was tiled!`);

		const message: Message = interaction.message as Message;
		const url = await getImageFromMessage(message);
		const attachment = (
			await tileAttachment({
				url: url,
				name: url.split("/").at(-1), //gets last element and trims off .png as it is readded later
			})
		)[0];

		if (attachment == null)
			return interaction.reply({
				content: await interaction.text({ string: "Command.Images.TooBig" }),
				ephemeral: true,
			});

		if (Object.values(client.config.submissions).filter((c) => c.submit === interaction.channel.id).length > 0)
			return interaction.reply({
				embeds: [new MessageEmbed().setImage(`attachment://${attachment.name}`).setTimestamp()],
				files: [attachment],
				components: [imageButtons],
				ephemeral: true,
			});
		else
			return interaction
				.reply({
					embeds: [
						new MessageEmbed()
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
};
