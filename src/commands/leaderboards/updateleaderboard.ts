import { ChatInputCommandInteraction, Client, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getLeaderboardMessageId } from "../../utils/leaderboards";
import { LeaderboardKey } from "../../model/leaderboardData.model";
import { generateFkillsLeaderboard, generateStarsLeaderboard, generateWinsLeaderboard } from "../../font/lib";
import hypixelApi from "../../hypixel/hypixelApi";
import { HypixelPlayer } from "../../model/hypixel/player.hypixel";

export default {
  data: new SlashCommandBuilder()
    .setName("updateleaderboard")
    .setDescription("Update a leaderboard")
    .addStringOption(option =>
      option.setName("type")
        .setDescription("The type of leaderboard to update")
        .setRequired(true)
        .addChoices(
          { name: "Stars", value: "stars" },
          { name: "Wins", value: "wins" },
          { name: "FKills", value: "fkills" },
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (client: Client, interaction: ChatInputCommandInteraction) => {
    const type = interaction.options.getString("type", true) as LeaderboardKey;

    const leaderboard_data = getLeaderboardMessageId(type);

    if (!leaderboard_data) {
      return interaction.reply({ content: "Leaderboard not found", ephemeral: true });
    }

    const { channelId, messageId } = leaderboard_data;

    const leaderboard_messages = leaderboard_data
      ? await client.channels.fetch(channelId)
          .then(c => (c && c.isTextBased() ? c.messages.fetch(messageId) : null))
          .catch(() => null)
      : null;

    if (!leaderboard_messages) {
      return interaction.editReply({ content: "Leaderboard message not found" });
    }
    
    let images: Buffer[] = [];
    const leaderboards = await hypixelApi.getBedwarsLeaderboards();
    if (!leaderboards) {
      return interaction.editReply({ content: "Leaderboards not found"});
    }
    
    switch (type) {
      case "stars": {
        const star_uuids = leaderboards.find(
          (lb) => lb.path === "bedwars_level",
        )?.leaders;
    
        if (!star_uuids) {
          return interaction.editReply({ content: "Stars leaderboard not found" });
        }
    
        const star_players = await fetchPlayers(star_uuids);
        images = await generateStarsLeaderboard(star_players);
        break;
      }
    
      case "wins": {
        const wins_uuids = leaderboards.find(
          (lb) => lb.path === "wins_new",
        )?.leaders;
    
        if (!wins_uuids) {
          return interaction.editReply({ content: "Wins leaderboard not found" });
        }
    
        const wins_players = await fetchPlayers(wins_uuids);
        images = await generateWinsLeaderboard(wins_players);
        break;
      }
    
      case "fkills": {
        const fkills_uuids = leaderboards.find(
          (lb) => lb.path === "final_kills_new",
        )?.leaders;
    
        if (!fkills_uuids) {
          return interaction.editReply({ content: "Fkills leaderboard not found" });
        }
    
        const fkills_players = await fetchPlayers(fkills_uuids);
        images = await generateFkillsLeaderboard(fkills_players);
        break;
      }
    }
    
    const files = images.map((img, i) => ({
      attachment: img,
      name: `${type}_leaderboard_image${i}.png`,
    }));
    
    const embeds = images.map((_, i) => ({
      image: {
        url: `attachment://${type}_leaderboard_image${i}.png`,
      },
    }));
    
  },
}

async function fetchPlayers(uuids: string[]) {
  const CONCURRENT = 2;
  const DELAY = 1000;

  const players: HypixelPlayer[] = [];

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < uuids.length; i += CONCURRENT) {
    const batch = uuids.slice(i, i + CONCURRENT);

    const results = await Promise.all(
      batch.map(async (uuid) => {
        const player = await hypixelApi.getPlayerData(uuid);
        return player ?? null;
      })
    );

    // push safely after batch completes
    for (const p of results) {
      if (p) players.push(p);
    }

    // wait before next batch (if not last)
    if (i + CONCURRENT < uuids.length) {
      await sleep(DELAY);
    }
  }

  return players;
}