import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	Client,
	PermissionFlagsBits,
} from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("replies with a pong!")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(client: Client, interaction: ChatInputCommandInteraction) {
		try {
			const sent = await interaction.fetchReply();

			const latency = sent.createdTimestamp - interaction.createdTimestamp;

			await interaction.editReply(`Pong! 🏓 ${latency}ms`);
		} catch (err) {
			console.error("Ping command failed:", err);
			await interaction.editReply(
				"Something went wrong while calculating latency.",
			);
		}
	},
};
