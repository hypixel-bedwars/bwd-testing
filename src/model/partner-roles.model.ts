export interface PartnerRoles {
  id: string;          // A unique ID or we can just use the user ID as unique
  userId: string;      // The user of the partner
  name: string;        // Name of the partner
  description: string; // Description for the dropdown
  roleId: string;      // The role for the pings
  emoji: string;       // Emoji to display in the dropdown
  createdAt?: Date;
  updatedAt?: Date;
}
