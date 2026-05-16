import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Client,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { readData, writeData } from "../../utils/dataReader";
import { PartnerRoles } from "../../model/partner-roles.model";
import crypto from "crypto";
import { getConfig } from "../../utils/envloader";
import { refreshPartnerRoleMenus } from "../../utils/partnerRoleMenus";

export default {
  data: new SlashCommandBuilder()
    .setName("partners")
    .setDescription("Manage partner roles for the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add a new partner role")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("The user this partner role is for")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("name")
            .setDescription("The name of the partner to display")
            .setRequired(true)
        )
        .addRoleOption((opt) =>
          opt
            .setName("role")
            .setDescription("The role to ping/assign for this partner")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("description")
            .setDescription("Description of the partner (for the dropdown)")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("emoji")
            .setDescription("Emoji to display (defaults to ▶️)")
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove a partner role")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("The user whose partner role to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("list")
        .setDescription("List all partner roles")
    )
    .addSubcommand((sub) =>
      sub
        .setName("set-universal")
        .setDescription("Set the universal 'All Partners' ping role")
        .addRoleOption((opt) =>
          opt
            .setName("role")
            .setDescription("Role that is pinged for all partner streams/videos")
            .setRequired(true)
        )
    ),

  async execute(client: Client, interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const partners = (await readData<PartnerRoles[]>("partners")) || [];
    const { PartnerUniversalRoleId } = getConfig();

    if (subcommand === "add") {
      const user = interaction.options.getUser("user", true);
      const name = interaction.options.getString("name", true);
      const role = interaction.options.getRole("role", true);
      if (role.id === PartnerUniversalRoleId) {
        await interaction.editReply({
          content:
            "❌ That role is configured as the universal `PARTNER_UNIVERSAL_ROLE` and can't be used as an individual partner role.",
        });
        return;
      }

      const description = interaction.options.getString("description", true);
      const emoji = interaction.options.getString("emoji", false) || "▶️";

      const existingIndex = partners.findIndex((p) => p.userId === user.id);
      
      const newPartner: PartnerRoles = {
        id: existingIndex >= 0 ? partners[existingIndex].id : crypto.randomUUID(),
        userId: user.id,
        name,
        roleId: role.id,
        description,
        emoji,
        createdAt: existingIndex >= 0 ? partners[existingIndex].createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (existingIndex >= 0) {
        partners[existingIndex] = newPartner;
      } else {
        partners.push(newPartner);
      }

      await writeData("partners", partners);
      if (interaction.guildId) {
        await refreshPartnerRoleMenus(client, interaction.guildId);
      }
      await interaction.editReply({
        content: `✅ Successfully ${existingIndex >= 0 ? "updated" : "added"} partner **${name}** for <@${user.id}>!`,
      });
      return;
    }

    if (subcommand === "remove") {
      const user = interaction.options.getUser("user", true);
      const existingIndex = partners.findIndex((p) => p.userId === user.id);

      if (existingIndex === -1) {
        await interaction.editReply({
          content: `❌ Could not find a partner entry for <@${user.id}>.`,
        });
        return;
      }

      const [removed] = partners.splice(existingIndex, 1);
      await writeData("partners", partners);

      if (interaction.guildId) {
        await refreshPartnerRoleMenus(client, interaction.guildId);
      }

      await interaction.editReply({
        content: `✅ Successfully removed partner **${removed.name}**.`,
      });
      return;
    }

    if (subcommand === "list") {
      if (partners.length === 0) {
        await interaction.editReply({
          content: "There are currently no partners configured.",
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("Configured Partners")
        .setColor("Blurple")
        .setDescription(
          partners
            .map(
              (p, i) =>
                `${i + 1}. **${p.name}** (<@${p.userId}>)\n` +
                `> Role: <@&${p.roleId}>\n` +
                `> Emoji: ${p.emoji}\n` +
                `> Desc: ${p.description}`
            )
            .join("\n\n")
        );

      await interaction.editReply({ embeds: [embed] });
			return;
    }

		if (subcommand === "set-universal") {
			const role = interaction.options.getRole("role", true);
			await interaction.editReply({
				content:
					"✅ Universal role set. Now update `.env` with: " +
					"`PARTNER_UNIVERSAL_ROLE=" +
					role.id +
					"` (and restart).",
			});
			return;
		}
  },
};
