import { ChannelType, Client, Message } from "discord.js";
import { getAutoResponderData } from "../utils/autoresponder.utils";
import { logger } from "../logger";

export default {
  name: "messageCreate",
  async execute(client: Client, message: Message) {
    if (message.author.bot || !message.guild) return;

    const data = getAutoResponderData();
    const content = message.content.toLowerCase();

    for (const entry of Object.values(data)) {
      if (content.includes(entry.username.toLowerCase())) {
        
        if (message.channel.type != ChannelType.GuildText) return;
        
        await message.channel.send(entry.response);

        logger.info(`autoresponded for ${entry.username}`);
        break;
      }
    }
  },
};