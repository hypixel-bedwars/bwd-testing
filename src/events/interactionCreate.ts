import {
	Client,
	Interaction,
	ChatInputCommandInteraction,
	MessageFlags,
} from "discord.js";
import { getConfig } from "../utils/envloader";
import { getCategoryContent } from "../model/embeds/roles.embed";
import { logger } from "../logger";

export default {
	name: "interactionCreate",
	async execute(client: Client, interaction: Interaction) {
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
      logger.error(
        {err: err},
				"Failed to defer interaction — likely a duplicate or expired token:",
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
			logger.warn("No commands collection found on client.");
			await interaction.editReply("Internal error: no commands collection.");
			return;
		}

		const command = commands.get(interaction.commandName);
		if (!command) {
			logger.error(
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
      logger.error({err: error}, `Error executing ${interaction.commandName}:`);
			logger.discord(`⚠️ Command error in ${interaction.commandName}: ${error}`);
			try {
				await interaction.editReply(
					"There was an error while executing this command.",
				);
			} catch (err2) {
				logger.error({err: err2}, "Failed to send error reply to user:");
			}
		}
	},
};
