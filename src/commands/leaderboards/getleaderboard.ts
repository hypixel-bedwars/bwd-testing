import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	Client,
	ChannelType,
	PermissionFlagsBits,
} from "discord.js";
import hypixelApi from "../../hypixel/hypixelApi";
import MinecraftColor from "../../model/minecraftColor.model";

export default {
	data: new SlashCommandBuilder()
		.setName("getleaderboard")
		.setDescription(
			"Returns the leaderboard                                                                                           ",
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(client: Client, interaction: ChatInputCommandInteraction) {
		if (
			!interaction.channel ||
			interaction.channel.type !== ChannelType.GuildText
		) {
			return await interaction.editReply({
				content: "This command can only be used in a server text channel.",
			});
		}

		const leaderboards = await hypixelApi.getBedwarsLeaderboards();
		if (!leaderboards) {
			return interaction.editReply("Failed to fetch leaderboards.");
		}

		const starLeaderboard = leaderboards.find(
			(lb) => lb.prefix === "bedwars_level",
		);

		if (!starLeaderboard) {
			return interaction.editReply("Bedwars level leaderboard not found.");
		}

		const leaders_array = starLeaderboard.leaders.slice(0, 5);

		const statLines = await Promise.all(
			leaders_array.slice(0, 10).map(async (uuid, index) => {
				const player = await hypixelApi.getPlayerData(uuid);

				const name = player?.displayname ?? "Unknown";
				const stars = player?.stars ?? 0;

				const color = stars >= 0 ? MinecraftColor.GREEN : MinecraftColor.RED;

				return (
					`${MinecraftColor.DARK_AQUA}#${index + 1} ${name} ` +
					`${MinecraftColor.DARK_GRAY}- ` +
					`${color}⭐ ${stars}`
				);
			}),
		);
	},
};
