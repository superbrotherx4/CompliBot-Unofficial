import axios from "axios";
import { info, warning } from "@helpers/logger";
import { Client } from "@client";
import { TextChannel } from "discord.js";

var minecraftVersionsCache = [];

export async function loadJavaVersions() {
	try {
		var { status, data: versions } = await axios.get(
			"https://launchermeta.mojang.com/mc/game/version_manifest_v2.json",
		);
	} catch (e) {
		console.log(`${warning}Failed to load Minecraft Java versions`);
		return;
	}

	if (versions === "" || status !== 200) {
		console.log(`${warning}Failed to load Minecraft Java versions`);
		return;
	}

	versions.versions.forEach((version) => {
		// uncomment to test for specific versions being released
		if (version.id === "22w13a") return;
		minecraftVersionsCache.push(version.id);
	});

	console.log(`${info}Loaded ${minecraftVersionsCache.length} Minecraft Java versions`);
}

export async function updateJavaVersions(client: Client) {
	try {
		try {
			var { status, data: versions } = await axios.get(
				"https://launchermeta.mojang.com/mc/game/version_manifest_v2.json",
			);
		} catch (e) {
			return;
		}

		if (versions === "" || status !== 200) {
			return;
		}

		versions.versions.forEach(async (version) => {
			if (!minecraftVersionsCache.includes(version.id)) {
				minecraftVersionsCache.push(version.id);

				let updateChannel = (await client.channels.cache.get("782961082477445120")) as TextChannel;

				// TODO: Find a way to reliably fetch the article from https://www.minecraft.net/content/minecraft-net/_jcr_content.articles.grid
				if (version.id.includes("pre")) {
					var pre = version.id.split("pre")[1];
					let res;
					res = await axios.get(
						`https://www.minecraft.net/en-us/article/minecraft-${version.id
							.split("-")[0]
							.replace(/\./g, "-")}-pre-release-${pre}`,
						{ validateStatus: () => true },
					);

					if (res.status == 404) {
						for (pre; pre > 1; pre--) {
							res = await axios.get(
								`https://www.minecraft.net/en-us/article/minecraft-${version.id
									.split("-")[0]
									.replace(/\./g, "-")}-pre-release-${pre}`,
								{ validateStatus: () => true },
							);

							if (res.status !== 404) {
								await updateChannel.send({
									content: `A new pre-release of Minecraft Java was just released: \`${
										version.id
									}\`\nhttps://www.minecraft.net/en-us/article/minecraft-${version.id
										.split("-")[0]
										.replace(/\./g, "-")}-pre-release-${pre}`,
								});
								break;
							}
						}
					} else {
						await updateChannel.send({
							content: `A new pre-release of Minecraft Java was just released: \`${
								version.id
							}\`\nhttps://www.minecraft.net/en-us/article/minecraft-${version.id
								.split("-")[0]
								.replace(/\./g, "-")}-pre-release-${pre}`,
						});
					}
				} else if (version.id.includes("rc")) {
					// it is very unlikely that there is more than one release candidate, so we'll just use the first one
					// if there is a second one, Mojang will use the first article anyway
					await updateChannel.send({
						content: `A new release candidate of Minecraft Java was just released: \`${
							version.id
						}\`\nhttps://www.minecraft.net/en-us/article/minecraft-${version.id
							.split("-")[0]
							.replace(/\./g, "-")}-release-candidate-1`,
					});
				} else {
					if (version.type === "snapshot")
						await updateChannel.send({
							content: `A new ${version.type} of Minecraft Java was just released: \`${version.id}\`\nhttps://www.minecraft.net/en-us/article/minecraft-snapshot-${version.id}`,
						});
					else if (version.type === "release")
						await updateChannel.send({
							content: `A new ${version.type} of Minecraft Java was just released: \`${
								version.id
							}\`\nhttps://www.minecraft.net/en-us/article/minecraft-java-edition-${version.id.replace(/\./g, "-")}`,
						});
				}
			}
		});
	} catch (e) {
		return;
	}
}