import { logger } from "../../logger";
import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	Client,
	PermissionFlagsBits,
	AttachmentBuilder,
	ChannelType,
	MessageFlags,
} from "discord.js";
import path from "path";
import { getRoleInformationFirstPage } from "../../model/embeds/rules.embed";
import { createDropdown } from "../../model/components/dropdown";
import { RULE_CATEGORIES } from "../../model/menu.options";

export default {
	data: new SlashCommandBuilder()
		.setName("rulesembed")
		.setDescription("Sends the rules embed to the current channel.")
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

		// Build menu options from RULE_CATEGORIES so we don't keep labels hard-coded here
		const menuOptions = RULE_CATEGORIES.map((cat) => cat.label);

		const row = createDropdown(
			"role_select_menu",
			"Select a category...",
			menuOptions,
		);

		const logoPath = path.resolve(__dirname, "../../../assets/logo.png");
		const logo = new AttachmentBuilder(logoPath, { name: "logo.png" });

		const container = getRoleInformationFirstPage(row, interaction);

		try {
			await interaction.channel.send({
				files: [logo],
				flags: MessageFlags.IsComponentsV2,
				components: [container],
			});

			await interaction.editReply({
				content: "✅ Rules embed has been sent to this channel.",
			});
		} catch (error) {
			logger.error({err: error});
			await interaction.editReply({
				content: "Failed to send the rules embed. Check my permissions!",
			});
		}
	},
};
