import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	Client,
	PermissionFlagsBits,
} from "discord.js";
import { initRoles, ROLES } from "../../utils/rolemanager";

export default {
	data: new SlashCommandBuilder()
		.setName("updateroles")
		.setDescription("Syncs roles and prints a copy-pasteable object to the console.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(client: Client, interaction: ChatInputCommandInteraction) {
		await initRoles(client);
		
		const roleEntries = Object.entries(ROLES);

		if (roleEntries.length === 0) {
			return await interaction.editReply("No roles found in the manager.");
		}

		const formattedForFile = roleEntries
			.map(([name, id]) => `    "${name}": "${id}",`)
			.join("\n");

		const finalCodeBlock = `export let ROLES: IRoles = {\n${formattedForFile}\n};`;

		console.log("\n--- COPY AND PASTE INTO ROLEMANAGER.TS ---");
		console.log(finalCodeBlock);
		console.log("-------------------------------------------\n");

		await interaction.editReply({
			content: "Roles have been synced, Check the console",
		});
	},
};