import {
	Client,
	Interaction,
	ChatInputCommandInteraction,
	MessageFlags,
} from "discord.js";
import { getConfig } from "../utils/envloader";
import { getCategoryContent } from "../model/embeds/rules.embed";

export default {
	name: "interactionCreate",
	async execute(client: Client, interaction: Interaction) {
		// Handles the components interaction
		if (interaction.isStringSelectMenu()) {
			if (interaction.customId === "role_select_menu") {
				const selection = interaction.values[0];
				const container = getCategoryContent(selection, interaction);

				await interaction.reply({
					components: [container],
					flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
				});

				setTimeout(async () => {
					try {
						await interaction.deleteReply();
					} catch (e) { }
				}, 300_000);

				return;
			}
		}

		// handles the slash command interactions
		if (!interaction.isChatInputCommand()) return;

		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		} catch (err) {
			console.error(
				"Failed to defer interaction — likely a duplicate or expired token:",
				err,
			);
			return;
		}

		const config = getConfig();

		if (interaction.user.id !== config.DevId) {
			await interaction.editReply({
				content: "You do not have permission to use this command.",
			});
			return;
		}

		const commands = (client as any).commands;
		if (!commands) {
			console.warn("No commands collection found on client.");
			await interaction.editReply("Internal error: no commands collection.");
			return;
		}

		const command = commands.get(interaction.commandName);
		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`,
			);
			await interaction.editReply(
				`Command not found: ${interaction.commandName}`,
			);
			return;
		}

		try {
			await command.execute(client, interaction as ChatInputCommandInteraction);
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}:`, error);
			try {
				await interaction.editReply(
					"There was an error while executing this command.",
				);
			} catch (err2) {
				console.error("Failed to send error reply to user:", err2);
			}
		}
	},
};
