import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Client,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import hypixelApi from "../../hypixel/hypixelApi";
import MinecraftColor from "../../model/minecraftColor.model";
import { generateMinecraftText, generatePolsuLikeLeaderboard } from "../../font/lib";
import { HypixelPlayer } from "../../model/hypixel/player.hypixel";

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
    
    const players: HypixelPlayer[] = [];
    
    for (let i = 0; i < 10; i += 2) {
      const batch = leaders_array.slice(i, i + 2);
    
      const results = await Promise.all(
        batch.map((uuid) => hypixelApi.getPlayerData(uuid))
      );
    
      results.forEach((player) => {
        if (player) players.push(player);
      });
    
      await sleep(1000);
    }

    const image = await generatePolsuLikeLeaderboard(players);

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
