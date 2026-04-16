import { Client, Role } from "discord.js";
import { initRoles } from "../../utils/rolemanager";

export default {
    name: "roleCreate",
    async execute(client: Client, role: Role) {
        console.log(`Role Created: ${role.name}. Refreshing cache...`);
        
        await initRoles(client);
    },
};