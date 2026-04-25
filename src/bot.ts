import { Client } from "discord.js";
import commandLoader from "./utils/commandloader";
import eventLoader from "./utils/eventloader";
import { initEnv } from "./utils/envloader";
import path from "path";
import { initTicketAutomator } from "./utils/ticket.automator";

export default async function initializeBot(client: Client<boolean>) {
  initEnv();

	// Pass the client to the command loader so commands can access the bot client if needed
	await commandLoader(path.join(__dirname, "commands"), client);
  eventLoader(path.join(__dirname, "events"), client);
  
  // initialize the automatic ticket responder
  await initTicketAutomator();
}
