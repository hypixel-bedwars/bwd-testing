import { ChannelType, Client, Message } from "discord.js";
import { getAutoResponderData } from "../utils/autoresponder.utils";
import { logger } from "../logger";

// We need to import the subscription logic to trigger it manually
import subscriptionHandler from "./subscriptions/subscriptions.renew"; // Adjust path if needed!

export default {
  name: "messageCreate",
  async execute(client: Client, message: Message) {
    // Testing for subscription events
    if (
      message.content === "!testsub new" &&
      message.author.id === "795526316832849932"
    ) {
      logger.info("Triggering mock subscription event...");
    
      (message as any).roleSubscriptionData = {
        tierName: "Gold Supporter",
        totalMonthsSubscribed: 3,
        isRenewal: true,
        roleSubscriptionListingId: "123456789",
      };
    
      await subscriptionHandler.execute(client, message);
    
      delete (message as any).roleSubscriptionData;
    
      return;
    }

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