import { pipeline } from "@xenova/transformers";
import { logger } from "../logger";

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

// eslint-disable-next-line
let embedder: any;
const promptEmbeddings: number[][] = [];

const prompts = [
    // General Greetings / Ticket Openings
    "Hi, I need help with something.",
    "Hello, can a mod assist me?",
    "I need to open a support ticket.",
    
    // Official Server Bans/Mutes
    "I was unfairly banned by Watchdog!",
    "How do I appeal my Hypixel ban?",
    "Help me get unbanned from the server.",
    "I got muted for no reason.",
    
    // Official Server Hackers/Reports
    "There is a hacker in my game, how do I report them?",
    "This player is flying and using kill aura.",
    "Where do I report someone for cheating?",
    
    // Official Server Lag/Outages
    "Why is Hypixel lagging so much?",
    "Is the server down right now?",
    "I can't connect to hypixel.net.",
    
    // Discord-Specific: Roles & Verification
    "How do I get the Bedwars level roles?",
    "My stats aren't syncing for discord roles.",
    "Where is the verify channel?",
    
    // Discord-Specific: Member Reporting
    "Someone is harassing me in the general channel.",
    "I need to report a toxic member in the discord.",
    "A user is breaking the discord rules.",
    
    // Compromised discord accounts
    "someone hacked my other discord with my main minecraft account linked to this server.",
    "My discord account got hacked and my Minecraft account is linked to it.",
    "Help, my discord was compromised and it has my hypixel account synced.",
    
    // Discord reports
    "I would like to report a user saying the N word in Vc i was in",
    "Someone is being racist in the voice channel.",
    "A user is using slurs in VC.",
    "Report toxic behavior in voice chat."
]

const responses = [
    // General Greetings / Ticket Openings
    "Hey there! A member of our staff team will be with you shortly. In the meantime, please describe your issue in detail so we can help you faster! (Note: We are an unofficial community-run server and cannot assist with official Hypixel bans). Official Support: https://support.hypixel.net/hc/en-us/requests/new",
    "Hey there! A member of our staff team will be with you shortly. In the meantime, please describe your issue in detail so we can help you faster! (Note: We are an unofficial community-run server and cannot assist with official Hypixel bans). Official Support: https://support.hypixel.net/hc/en-us/requests/new",
    "Hey there! A member of our staff team will be with you shortly. In the meantime, please describe your issue in detail so we can help you faster! (Note: We are an unofficial community-run server and cannot assist with official Hypixel bans). Official Support: https://support.hypixel.net/hc/en-us/requests/new",
    
    // Official Server Bans/Mutes
    "Our staff will be online soon to chat, but please note: we are an **unofficial community Discord** and cannot lift Hypixel server bans. While you wait, please have your appeal ready for the official forums here: https://hypixel.net/forums/punishment-appeals.36/",
    "Our staff will be online soon to chat, but please note: we are an **unofficial community Discord** and cannot lift Hypixel server bans. While you wait, please have your appeal ready for the official forums here: https://hypixel.net/forums/punishment-appeals.36/",
    "Our staff will be online soon to chat, but please note: we are an **unofficial community Discord** and cannot lift Hypixel server bans. While you wait, please have your appeal ready for the official forums here: https://hypixel.net/forums/punishment-appeals.36/",
    "Our staff will be online soon to chat, but please note: we are an **unofficial community Discord** and cannot lift Hypixel server bans. While you wait, please have your appeal ready for the official forums here: https://hypixel.net/forums/punishment-appeals.36/",
    
    // Official Server Hackers/Reports
    "A staff member will check this ticket soon. If you are reporting a hacker on the Hypixel server, please ensure you have used `/report [name]` in-game first. You can also view official reporting methods here: https://support.hypixel.net/hc/en-us/articles/360019646359-How-to-Report-Rule-Breakers-on-Hypixel",
    "A staff member will check this ticket soon. If you are reporting a hacker on the Hypixel server, please ensure you have used `/report [name]` in-game first. You can also view official reporting methods here: https://support.hypixel.net/hc/en-us/articles/360019646359-How-to-Report-Rule-Breakers-on-Hypixel",
    "A staff member will check this ticket soon. If you are reporting a hacker on the Hypixel server, please ensure you have used `/report [name]` in-game first. You can also view official reporting methods here: https://support.hypixel.net/hc/en-us/articles/360019646359-How-to-Report-Rule-Breakers-on-Hypixel",
    
    // Official Server Lag/Outages
    "Our team is aware of your query and will respond soon. Please keep in mind we are not Hypixel staff and cannot fix server-wide lag. You can check for official updates or contact support here: https://support.hypixel.net/hc/en-us/requests/new",
    "Our team is aware of your query and will respond soon. Please keep in mind we are not Hypixel staff and cannot fix server-wide lag. You can check for official updates or contact support here: https://support.hypixel.net/hc/en-us/requests/new",
    "Our team is aware of your query and will respond soon. Please keep in mind we are not Hypixel staff and cannot fix server-wide lag. You can check for official updates or contact support here: https://support.hypixel.net/hc/en-us/requests/new",
    
    // Discord-Specific: Roles & Verification
    "Staff will be here in a moment to assist with your roles. To speed things up, please provide your **Minecraft IGN** and a screenshot of your `/verify` message if applicable. Guide: https://support.hypixel.net/hc/en-us/articles/360019647059-Linking-Your-Minecraft-Account-to-Hypixel-net",
    "Staff will be here in a moment to assist with your roles. To speed things up, please provide your **Minecraft IGN** and a screenshot of your `/verify` message if applicable. Guide: https://support.hypixel.net/hc/en-us/articles/360019647059-Linking-Your-Minecraft-Account-to-Hypixel-net",
    "Staff will be here in a moment to assist with your roles. To speed things up, please provide your **Minecraft IGN** and a screenshot of your `/verify` message if applicable. Guide: https://support.hypixel.net/hc/en-us/articles/360019647059-Linking-Your-Minecraft-Account-to-Hypixel-net",
    
    // Discord-Specific: Member Reporting
    "Thank you for the report. A Discord moderator will be here shortly. Please provide the following if not already**User ID** of the person you are reporting and **screenshots of the incident** so we can take immediate action.",
    "Thank you for the report. A Discord moderator will be here shortly. Please provide the following if not already**User ID** of the person you are reporting and **screenshots of the incident** so we can take immediate action.",
    "Thank you for the report. A Discord moderator will be here shortly. Please provide the following if not already**User ID** of the person you are reporting and **screenshots of the incident** so we can take immediate action.",
    
    // Hacked Account Responses
    "I'm sorry to hear about your account. A staff member will be with you shortly to help secure your Discord profile. **In the meantime, please provide: 1. Your old IGN, 2. Your new IGN, and 3. The Discord ID of the compromised account.** While we wait, please contact official support: https://support.hypixel.net/hc/en-us/requests/new",
    "I'm sorry to hear about your account. A staff member will be with you shortly to help secure your Discord profile. **In the meantime, please provide: 1. Your old IGN, 2. Your new IGN, and 3. The Discord ID of the compromised account.** While we wait, please contact official support: https://support.hypixel.net/hc/en-us/requests/new",
    "I'm sorry to hear about your account. A staff member will be with you shortly to help secure your Discord profile. **In the meantime, please provide: 1. Your old IGN, 2. Your new IGN, and 3. The Discord ID of the compromised account.** While we wait, please contact official support: https://support.hypixel.net/hc/en-us/requests/new",

    // Discord reports
    "Thank you for bringing this to our attention. We have a zero-tolerance policy for slurs and toxicity. A moderator will be with you as soon as possible. **In the meantime, please provide: 1. The User ID of the offender, 2. Which VC this happened in, and 3. Any recordings or names of witnesses who were present.**",
    "Thank you for bringing this to our attention. We have a zero-tolerance policy for slurs and toxicity. A moderator will be with you as soon as possible. **In the meantime, please provide: 1. The User ID of the offender, 2. Which VC this happened in, and 3. Any recordings or names of witnesses who were present.**",
    "Thank you for bringing this to our attention. We have a zero-tolerance policy for slurs and toxicity. A moderator will be with you as soon as possible. **In the meantime, please provide: 1. The User ID of the offender, 2. Which VC this happened in, and 3. Any recordings or names of witnesses who were present.**",
    "Thank you for bringing this to our attention. We have a zero-tolerance policy for slurs and toxicity. A moderator will be with you as soon as possible. **In the meantime, please provide: 1. The User ID of the offender, 2. Which VC this happened in, and 3. Any recordings or names of witnesses who were present.**"
]

const defaultResponse = "Thanks for reaching out — a staff member will review your ticket shortly.\nIn the meantime, please provide as much detail as possible (usernames, timestamps, screenshots, etc.) so we can assist you faster.\n(Note: We are an unofficial community-run server and cannot assist with official Hypixel bans or account recovery. For those issues, please contact official support: https://support.hypixel.net/hc/en-us/requests/new)";

export async function initTicketAutomator() {
  logger.info("Initializing ticket automator...");
  embedder = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  );

  for (const p of prompts) {
    const output = await embedder(p, { pooling: 'mean', normalize: true });
    promptEmbeddings.push(output.data);
  }
  logger.info("Ticket automator initialized.");
}

export async function getTicketResponse(input: string): Promise<string> {
  if (!embedder) {
    logger.discord("Ticket automator not initialized yet.");
    return defaultResponse;
  }

  const query = await embedder(input, { pooling: 'mean', normalize: true });
  const queryVec = query.data;

  let bestScore = -1;
  let bestIdx = 0;

  for (let i = 0; i < promptEmbeddings.length; i++) {
    const score = cosineSimilarity(queryVec, promptEmbeddings[i]);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  
  // Adjust the threshold as needed based on testing.
  if (bestScore < 0.55) {
    return defaultResponse;
  }

  return responses[bestIdx];
}