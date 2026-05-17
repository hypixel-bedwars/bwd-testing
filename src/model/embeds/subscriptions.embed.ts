import {
  ContainerBuilder,
  SeparatorBuilder,
} from "discord.js";

export function getSubscriptionsEmbed() {
  return new ContainerBuilder()
    .setAccentColor(0x2b2d31)
    .addTextDisplayComponents((text) =>
      text.setContent(
        `# Thank you for supporting the BWD\n` +
          `Before we get into the perks, we want to sincerely thank you for helping support the **largest community-run Bedwars Discord**! We hope you enjoy the perks! <:catwink:1494954092059955232>`,
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents((text) =>
      text.setContent(
        `# Subscription Tiers <:Nitro:1494691370940502068>\n` +
          `• **Pro** — $2.99/month\n` +
          `• **Elite** — $5.99/month\n` +
          `• **Champion** — $12.99/month`,
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents((text) =>
      text.setContent(
        `# Tier Perks 🎟️\n` +
          `### Pro (Tier 1)\n` +
          `• Extra giveaway entries\n` +
          `• Access to role colours (Wool roles)\n` +
          `• Embed and images perms in General Chat\n` +
          `• Ability to react with emojis in General Chat\n` +
          `### Elite (Tier 2)\n` +
          `• **All Pro perks**\n` +
          `• Emoji of choice in your name\n` +
          `• Soundboard access\n` +
          `• Streaming permissions in voice channels\n` +
          `• Custom color role with a gradient (glass roles, can't choose the name given for the role)\n` +
          `### Champion (Tier 3)\n` +
          `• **All Elite perks**\n` +
          `• Custom role with custom emoji\n` +
          `• Add a Sticker or Emoji to the server\n` +
          `• Personal autoresponder (when someone mentions your username, it replies with a message you choose — must follow server rules)\n` +
          `• Shoutout at the end of our YouTube videos`,
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents((text) =>
      text.setContent(
        `# About Glass Roles\n\n` +
          `Elite subscribers get access to our exclusive Glass Roles — beautiful gradient-colored roles. You can choose from multiple stunning gradient styles, but the role name will be automatically set based on the gradient you pick (you cannot customize the name)`,
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents((text) =>
      text.setContent(
        `# Long-Term Supporter Rewards\n\n` +
          `• Elite and Champion subscribers receive progressive **Loyal Legend** roles based on their subscription length:\n` +
          `  • **1 Month**  → **Loyal Legend I**\n` +
          `  • **3 Months** → **Loyal Legend II**\n` +
          `  • **6 Months** → **Loyal Legend III**\n` +
          `• This role is **NOT permanent** (it does not stay when you cancel later).\n` +
          `• All active subscribers also receive a monthly shoutout, including how long you’ve been subscribed!`,
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents((text) =>
      text.setContent(
        `# Additional Info\n\n` +
          `• Questions, suggestions or feedback? Open a ticket!\n` +
          `• Perks are only active while subscribed (except the permanent Loyal Legend role).\n` +
          `• Refund available within **5 days** → [Request a Refund](https://support.discord.com/hc/en-us/requests/new)\n` +
          `(Full policy: [Discord Refund Policy](https://support.discord.com/hc/en-us/articles/360012668071-Refund-Policy))`,
      ),
    );
}
