import { Event } from "@interfaces";
import { Client, CommandInteraction, ButtonInteraction, SelectMenuInteraction } from "@client";
import { Interaction } from "discord.js";

export const event: Event = {
	name: "interactionCreate",
	run: async (client: Client, interaction: Interaction) => {
		if (!interaction.inGuild()) return;

		const banlist = require("@json/botbans.json");
		if (banlist.ids.indexOf(interaction.user.id) > -1) {
			(interaction as CommandInteraction | ButtonInteraction | SelectMenuInteraction).reply({
				content: await (interaction as CommandInteraction | ButtonInteraction | SelectMenuInteraction).getEphemeralString({
					string: "Command.Botban.isBanned",
				}),
				ephemeral: true,
			});
			return;
		}

		if (interaction.isCommand()) {
			let _ = (interaction as CommandInteraction) instanceof CommandInteraction; //! do not remove, 'force' interaction to be casted (break if removed)
			client.emit("slashCommandUsed", (client as Client, interaction));
		}
		if (interaction.isButton()) {
			let _ = (interaction as ButtonInteraction) instanceof ButtonInteraction; //! do not remove, 'force' interaction to be casted (break if removed)
			client.emit("buttonUsed", (client as Client, interaction));
		}

		if (interaction.isSelectMenu()) {
			let _ = (interaction as SelectMenuInteraction) instanceof SelectMenuInteraction; //! do not remove, 'force' interaction to be casted (break if removed)
			client.emit("selectMenuUsed", (client as Client, interaction));
		}
	},
};
