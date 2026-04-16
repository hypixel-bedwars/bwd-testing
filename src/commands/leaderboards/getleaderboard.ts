import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	Client,
	ChannelType,
	PermissionFlagsBits,
} from "discord.js";
import hypixelApi from "../../hypixel/hypixelApi";

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

		const leaders_arrey = starLeaderboard.leaders.slice(0, 5);

		leaders_arrey.forEach((leader_uuid) => {
			const leader_stats = hypixelApi.getPlayerData(leader_uuid);
		});
	},
};
