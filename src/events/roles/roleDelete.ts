import { Client, Role } from "discord.js";
import { initRoles } from "../../utils/rolemanager";

export default {
    name: "roleDelete",
    async execute(client: Client, role: Role) {
        console.log(`Role Deleted: ${role.name}. Refreshing cache...`);
        
        // Refresh the variable so the deleted role ID is removed
        await initRoles(client);
    },
};