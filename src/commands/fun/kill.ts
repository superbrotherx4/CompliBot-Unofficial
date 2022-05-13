import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, Message } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("kill")
		.setDescription("Kill someone you tag, be careful with weapons!")
		.addUserOption((user) => user.setName("user").setDescription("User to be killed."))
		.addStringOption((string) => string.setName("weapon").setDescription("Weapon to kill the user with.")),
	execute: async (interaction: CommandInteraction) => {
		let embed = new MessageEmbed();

		const killed = (
			await interaction.getEphemeralString({ string: "Command.Kill.Killed", placeholders: { IGNORE_MISSING: "True" } })
		).split("$,");
		const killed_by = (
			await interaction.getEphemeralString({
				string: "Command.Kill.KilledBy",
				placeholders: { IGNORE_MISSING: "True" },
			})
		).split("$,");
		const killed_by_using = (
			await interaction.getEphemeralString({
				string: "Command.Kill.KilledByUsing",
				placeholders: { IGNORE_MISSING: "True" },
			})
		).split("$,");

		if (interaction.options.getUser("user") !== null) {
			if (interaction.options.getString("weapon") !== null)
				embed.setDescription(
					killed_by_using[Math.floor(Math.random() * killed_by_using.length)]
						.replace("%AUTHOR%", interaction.member.user.username)
						.replace("%PLAYER%", interaction.options.getUser("user").username)
						.replace("%WEAPON%", interaction.options.getString("weapon")),
				);
			else
				embed.setDescription(
					killed_by[Math.floor(Math.random() * killed_by.length)]
						.replace("%AUTHOR%", interaction.member.user.username)
						.replace("%PLAYER%", interaction.options.getUser("user").username),
				);
		} else
			embed.setDescription(
				killed[Math.floor(Math.random() * killed.length)].replace("%AUTHOR%", interaction.member.user.username),
			);

		interaction.reply({ embeds: [embed], fetchReply: true }).then((message: Message) => message.deleteButton());
	},
};
