import { Component } from "@interfaces/components";
import { Event } from "@interfaces/events";
import { Client, ButtonInteraction } from "@client";
import { info } from "@helpers/logger";

export default {
	name: "buttonUsed",
	async execute(client: Client, interaction: ButtonInteraction) {
		client.storeAction("button", interaction);

		if (client.verbose) console.log(`${info}Button used`);
		let button: Component;

		if (interaction.customId.startsWith("pollVote__")) button = client.buttons.get("pollVote");
		else button = client.buttons.get(interaction.customId);

		if (button) return button.execute(client, interaction);
	},
} as Event;
