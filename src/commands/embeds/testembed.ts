import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	Client,
	PermissionFlagsBits,
} from "discord.js";
import getTestEmbed from "../../model/embeds/test.embed";

export default {
	data: new SlashCommandBuilder()
		.setName("testembed")
		.setDescription("Sends a testing testembed")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(client: Client, interaction: ChatInputCommandInteraction) {
		const embed = getTestEmbed();

		// If this interaction hasn't been acknowledged yet, send a reply.
		// If it was already deferred, edit the deferred reply instead.
		if (!interaction.deferred && !interaction.replied) {
			await interaction.reply({ embeds: [embed] });
		} else {
			await interaction.editReply({ embeds: [embed] });
		}
	},
};
