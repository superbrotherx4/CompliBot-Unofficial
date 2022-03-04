import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, Message, MessageEmbed } from "@src/Extended Discord";
import { AnyChannel, MessageAttachment, VoiceChannel } from "discord.js";
import { compute, computeAll, computeAndUpdate, computeAndUpdateAll, MissingResult, MissingResults } from "@functions/missing";
import axios from "axios";
import { doNestedArr } from "@helpers/arrays";

/**
 * ! todo: add support for custom MC versions
 */

export const PACKS: Array<[name: string, value: string]> = [
	["Compliance 32x", "c32"],
	["Compliance 64x", "c64"],
	["Classic Faithful 32x", "classic_faithful_32"],
	["Classic Faithful 64x", "classic_faithful_64"],
	["Classic Faithful 32x Programmer Art", "classic_faithful_32_progart"],
]

/**
 * Get the displayed name for the value property
 * @param pack {string}
 * @returns {string}
 */
export const getDisplayNameForPack = (pack: string): string => {
	return PACKS.filter(p => p[1] === pack)[0][0];
}

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("missing")
    .setDescription("Shows tree view of missing textures for a particular edition")
		.addStringOption((option) =>
			option
				.setName("pack")
				.setDescription("Resource pack of the texture you are searching for.")
				.addChoices(PACKS)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("edition")
				.setDescription("Edition for the requested pack.")
				.addChoices([
					["Java", "java"],
					["Bedrock", "bedrock"],
					["All", "all"],
					// ["Minecraft Dungeons", "dungeons"], //todo: make dirs corresponding to the same setup for 32x & default repos
				])
				.setRequired(true),
		)
		.addBooleanOption((option) => 
			option
				.setName("update_channels")
				.setDescription("Update completion channels after command.")
				.setRequired(false)
		)
		// .addStringOption(async (option) => {
		// 	return option
		// 		.setName("version")
		// 		.setDescription("Minecraft version you want to see completion.")
		// 		.addChoices(doNestedArr((await axios.get(`settings/versions`)).data))
		// 		.setRequired(false)
		// })
		,
  execute: async (interaction: CommandInteraction) => {
		await interaction.deferReply();

		const edition: string = interaction.options.getString("edition", true);
		const pack: string = interaction.options.getString("pack", true);
		const updateChannels: boolean = interaction.options.getBoolean("update_channels") === null ? false : interaction.options.getBoolean("update_channels");

		const embed: MessageEmbed = new MessageEmbed()
			.setTitle("Searching for missing textures...")
			.setDescription("This takes some times, please wait...")
			.setThumbnail(`${(interaction.client as Client).config.images}bot/loading.gif`)
			.addField('Steps', 'Steps will be listed here');

		await interaction.editReply({ embeds: [embed] });
		let steps: Array<string> = [];

		let stepCallback = async (step: string) => {
			if (step === "") steps = ["Next one..."]
			else {
				if (steps.length === 1 && steps[0] === "Next one...") steps = [];
				steps.push(step);
			}

			embed.fields[0].value = steps.join('\n');
			await interaction.editReply({ embeds: [embed] });
		}

		const catchErr = (err: string | Error) => {
			let errMessage: string = (err as Error).message;
			if (!errMessage) {
				console.error(err)
        errMessage = 'An error occured when launching missing command. Please check console error output for more infos';
			}

			try {
				interaction.deleteReply();
			} catch {} // already gone

			interaction.editReply({ content: errMessage });
			return null;
		}

		let responses: MissingResults;

		if (edition === "all") {
			if (updateChannels) responses = await computeAndUpdateAll(interaction.client as Client, pack, "latest", stepCallback).catch(catchErr);
			else responses = await computeAll(interaction.client as Client, pack, "latest", stepCallback).catch(catchErr);
		}
		else {
			if (updateChannels) responses = [await computeAndUpdate(interaction.client as Client, pack, "latest", edition, stepCallback).catch(catchErr)];
			else responses = [await compute(interaction.client as Client, pack, "latest", edition, stepCallback).catch(catchErr)];
		}

		const files: Array<MessageAttachment> = [];
		const embed2: MessageEmbed = new MessageEmbed();

		responses.forEach((response: MissingResult) => {
			// no repo found for the asked pack + edition
			if (response[0] === null)	embed2.addField(`${getDisplayNameForPack(response[2].pack)} (${response[2].edition}) progress:`, `${response[2].completion}% complete\n> ${response[1][0]}`);
			else {
				files.push(new MessageAttachment(response[0], `missing-${response[2].pack}-${response[2].edition}.txt`));
				embed2.addField(`${getDisplayNameForPack(response[2].pack)} (${response[2].edition}) progress:`, `${response[2].completion}% complete\n> ${response[1].length} textures missing.`);
			}
		})

		return interaction.editReply({ embeds: [embed2], files: files });
  }
}
