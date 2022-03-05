import { Button } from "@interfaces";
import { Client, Message, ButtonInteraction } from "@client";
import { submissionButtonsClosed, submissionButtonsVotes } from "@helpers/buttons";

export const button: Button = {
	buttonId: "submissionSeeLess",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		const message: Message = interaction.message as Message;

		if (message.components.length == 2)
			await message.edit({ components: [submissionButtonsClosed, submissionButtonsVotes] });
		else await message.edit({ components: [submissionButtonsClosed] });

		try {
			interaction.update({});
		} catch (err) {
			console.error(err);
		}
	},
};
