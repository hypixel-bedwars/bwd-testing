import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Client,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import hypixelApi from "../../hypixel/hypixelApi";
import MinecraftColor from "../../model/minecraftColor.model";
import { generateMinecraftText } from "../../font/lib";

export default {
  data: new SlashCommandBuilder()
    .setName("getleaderboard")
    .setDescription(
      "Returns the leaderboard",
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
      (lb) => lb.path === "bedwars_level",
    );

    if (!starLeaderboard) {
      return interaction.editReply("Bedwars level leaderboard not found.");
    }

    const leaders_array = starLeaderboard.leaders.slice(0, 5);

    const statLines: string[] = [];
    const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    
    for (let i = 0; i < 10; i += 2) {
      const batch = leaders_array.slice(i, i + 2);
    
      const players = await Promise.all(
        batch.map((uuid) => hypixelApi.getPlayerData(uuid))
      );
    
      players.forEach((player, j) => {
        const index = i + j + 1;
        const player_color = player?.monthlyRankColor
        statLines.push(
          `${MinecraftColor.GREEN}#${index} ${player?.tagString}${player?.displayname} ${MinecraftColor.DARK_GRAY}- ${player?.formattedstars}`
        );
      });
    
      await sleep(1000);
    }

    const image = await generateMinecraftText(statLines, true, 3);

    await interaction.editReply({
      files: [
        {
          attachment: image, // Buffer
          name: "image.png",
        },
      ],
    });
  },
};
