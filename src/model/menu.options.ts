interface RuleCategory {
    label: string;
    value: string;
}

export const RULE_CATEGORIES: RuleCategory[] = [
    { label: "Discord Staff / Partnerships", value: "discordstaff"},
    { label: "Hypixel Staff / Ranks", value: "hypixelstaff"},
    { label: "Cosmetics", value: "cosmetics"},
    { label: "Events", value: "events"},
    { label: "Legacy", value: "legacy"},
] as const;

export const ruleValueList = RULE_CATEGORIES.map(opt => opt.value);