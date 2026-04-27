import { ChatInputCommandInteraction, SlashCommandBuilder, Client, PermissionFlagsBits } from "discord.js";
import { getTicketResponse } from "../../utils/ticket.automator";

export default {
	data: new SlashCommandBuilder()
		.setName("ticket-tester")
    .setDescription("Input a string and the bot will reply with a message it thinks is a good reply to it!!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option => option.setName("input").setDescription("The string you want the bot to reply to").setRequired(true)),

  async execute(client: Client, interaction: ChatInputCommandInteraction) {
		const input = interaction.options.getString("input", true);
    // Here you would implement your logic to generate a reply based on the input string.
    // For demonstration purposes, let's just echo the input back with a message.
    const reply = await getTicketResponse(input)
    await interaction.editReply({ content: reply })
	},
};