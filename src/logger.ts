import pino from "pino";
import { TextBasedChannel, EmbedBuilder } from "discord.js";

let discordChannel: any = null; 

const base = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: { colorize: true },
        }
      : undefined,
});

export const logger = Object.assign(base, {
  setDiscordChannel(channel: TextBasedChannel) {
    discordChannel = channel;
  },

  async discord(message: string, meta?: any) {
    base.info(meta, message);
  
    if (!discordChannel || !discordChannel.isSendable()) return;
  
    try {
      const embed = new EmbedBuilder()
        .setAuthor({ name: "System Log" })
        .setDescription(message)
        .setColor(0x2b2d31)
        .setTimestamp();

      if (meta) {
        const jsonMeta = JSON.stringify(meta, null, 2).slice(0, 1010);
        embed.addFields({
          name: "Metadata",
          value: `\`\`\`json\n${jsonMeta}\n\`\`\``,
        });
      }
  
      await discordChannel.send({ embeds: [embed] });
    } catch (err) {
      base.error({ err }, "Failed to send Discord log embed");
    }
  },
});