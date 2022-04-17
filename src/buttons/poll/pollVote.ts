import { Button } from "@interfaces";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@client";
import { Poll } from "@class/poll";

export const button: Button = {
	buttonId: "pollVote",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		await interaction.deferUpdate();
		const message: Message = interaction.message as Message;
		const embed: MessageEmbed = message.embeds[0];

		// get poll, update it
		const pid: string = embed.footer.text.split(" | ")[0];
		const poll: Poll = new Poll(client.polls.get(pid));

		const type: string = interaction.customId.replace("pollVote__", "");
		const id: string = interaction.user.id;

		if (poll.hasVotedFor(type, id)) poll.removeVote(type, id);
		else poll.addVote(type, id);

		await poll.updateEmbed(client);

		if (poll.isAnonymous())
			interaction.followUp({
				ephemeral: true,
				content: poll.hasVotedFor(type, id) ? "Your vote has been counted." : "Your vote has been removed.",
			});

		client.polls.set(pid, poll);
	},
};