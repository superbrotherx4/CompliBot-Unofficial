import { Component } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction } from "@client";
import { MessageInteraction } from "discord.js";

export default {
	id: "pollDelete",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Poll Message deleted!`);

		const messageInteraction = interaction.message.interaction as MessageInteraction;
		const message = interaction.message as Message;
		const pid = interaction.message.embeds[0].footer.text.split(" | ")[0];

		if (messageInteraction != undefined && interaction.user.id != messageInteraction.user.id)
			return interaction.reply({
				content: interaction
					.strings()
					.error.interaction.reserved.replace("%USER%", `<@!${messageInteraction.user.id}>`),
				ephemeral: true,
			});

		try {
			message.delete();
		} catch (err) {
			interaction.reply({
				content: interaction.strings().error.message.deleted,
				ephemeral: true,
			});
		}

		// try deleting poll from json file if pid is valid
		try {
			client.polls.delete(pid);
		} catch {
			/* pid not valid */
		}

		return;
	},
} as Component;