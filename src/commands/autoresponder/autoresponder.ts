import {
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

import {
  addOrUpdateAutoResponder,
  removeAutoResponderById,
} from "../../utils/autoresponder.utils";

function extractUsername(nickname: string): string | null {
  const match = nickname.match(/\]\s*(\S+)$/);
  return match ? match[1].toLowerCase() : null;
}

export default {
  data: new SlashCommandBuilder()
    .setName("autoresponder")
    .setDescription("Manage auto responder users")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand((subcommand) =>
      subcommand
        .setName("new")
        .setDescription("Add a new auto responder")
        .addUserOption((option) =>
          option
            .setName("member")
            .setDescription("Discord member")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("response")
            .setDescription("Response message")
            .setRequired(true),
        ),
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove auto responder")
        .addUserOption((option) =>
          option
            .setName("member")
            .setDescription("Discord member")
            .setRequired(true),
        ),
    ),

  async execute(client: Client, interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    const member = interaction.options.getMember("member");

    if (!member || !("nickname" in member) || !("user" in member)) {
      return interaction.editReply({
        content: "❌ Could not resolve member.",
      });
    }

    const userId = member.user.id;

    if (subcommand === "new") {
      const nickname = member.nickname;

      if (!nickname) {
        return interaction.editReply({
          content: "❌ This member does not have a nickname set.",
        });
      }

      const username = extractUsername(nickname);

      if (!username) {
        return interaction.editReply({
          content:
            "❌ Invalid nickname format. Expected something like `[69420 ✞] VA80`.",
        });
      }

      const response = interaction.options.getString("response", true);

      const result = await addOrUpdateAutoResponder(userId, username, response);

      if (!result.success) {
        return interaction.editReply({
          content:
            result.reason === "USERNAME_EXISTS"
              ? `❌ Username **${username}** is already registered to a different user.`
              : `❌ Failed to set auto responder for **${username}**.`,
        });
      }

      return interaction.editReply({
        content: `✅ Auto responder set for **${username}**`,
      });
    }

    if (subcommand === "remove") {
      const success = await removeAutoResponderById(userId);

      const username = (() => {
        const nickname = member.nickname;
        if (!nickname) return null;
        return extractUsername(nickname);
      })();

      return interaction.editReply({
        content: success
          ? username
            ? `✅ Removed auto responder for **${username}**`
            : `✅ Removed auto responder for <@${userId}>`
          : `❌ No auto responder entry found for <@${userId}>.`,
      });
    }
  },
};
