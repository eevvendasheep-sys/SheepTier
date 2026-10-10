import type { GameMode, Player, Ranking, SiteSettings, Tier } from "./types";

export const demoSettings: SiteSettings = {
  id: 1,
  site_name: "SheepTier",
  tagline: "Le classement Minecraft qui sépare les moutons des légendes.",
  announcement: "Bienvenue sur SheepTier",
  accent_color: "#A78BFA",
  discord_url: null
};

export const demoModes: GameMode[] = [
  { id: "sword", name: "Sword", slug: "sword", description: "Duel classique à l'épée.", logo_url: "/gamemodes/sword.svg", sort_order: 1, enabled: true },
  { id: "crystal", name: "Crystal", slug: "crystal", description: "End Crystal PvP.", logo_url: "/gamemodes/crystal.svg", sort_order: 2, enabled: true },
  { id: "smp", name: "SMP", slug: "smp", description: "Combat survie moderne.", logo_url: "/gamemodes/smp.svg", sort_order: 3, enabled: true },
  { id: "pot", name: "Pot", slug: "pot", description: "NoDebuff / potions.", logo_url: "/gamemodes/pot.svg", sort_order: 4, enabled: true }
];

export const demoTiers: Tier[] = [
  { id: "ht1", code: "HT1", label: "High Tier 1", color: "#F7D774", points: 60, sort_order: 1 },
  { id: "lt1", code: "LT1", label: "Low Tier 1", color: "#F2B45B", points: 45, sort_order: 2 },
  { id: "ht2", code: "HT2", label: "High Tier 2", color: "#A78BFA", points: 30, sort_order: 3 },
  { id: "lt2", code: "LT2", label: "Low Tier 2", color: "#8B7CF6", points: 20, sort_order: 4 },
  { id: "ht3", code: "HT3", label: "High Tier 3", color: "#6EE7B7", points: 10, sort_order: 5 },
  { id: "lt3", code: "LT3", label: "Low Tier 3", color: "#34D399", points: 6, sort_order: 6 },
  { id: "ht4", code: "HT4", label: "High Tier 4", color: "#7DD3FC", points: 4, sort_order: 7 },
  { id: "lt4", code: "LT4", label: "Low Tier 4", color: "#38BDF8", points: 3, sort_order: 8 },
  { id: "ht5", code: "HT5", label: "High Tier 5", color: "#94A3B8", points: 2, sort_order: 9 },
  { id: "lt5", code: "LT5", label: "Low Tier 5", color: "#64748B", points: 1, sort_order: 10 }
];

export const demoPlayers: Player[] = [
  { id: "p1", minecraft_uuid: "069a79f444e94726a5befca90e38aaf5", username: "Notch", namemc_url: "https://namemc.com/profile/Notch", skin_url: null, region: "EU" },
  { id: "p2", minecraft_uuid: "853c80ef3c3749fdaa49938b674adae6", username: "jeb_", namemc_url: "https://namemc.com/profile/jeb_", skin_url: null, region: "EU" },
  { id: "p3", minecraft_uuid: "4566e69fc90748ee8d71d7ba5aa00d20", username: "Dinnerbone", namemc_url: "https://namemc.com/profile/Dinnerbone", skin_url: null, region: "NA" }
];

export const demoRankings: Ranking[] = [
  { player_id: "p1", gamemode_id: "sword", tier_id: "ht2", points: 30 },
  { player_id: "p1", gamemode_id: "smp", tier_id: "lt2", points: 20 },
  { player_id: "p2", gamemode_id: "crystal", tier_id: "ht1", points: 60 },
  { player_id: "p2", gamemode_id: "pot", tier_id: "ht3", points: 10 },
  { player_id: "p3", gamemode_id: "sword", tier_id: "lt1", points: 45 },
  { player_id: "p3", gamemode_id: "crystal", tier_id: "lt3", points: 6 }
];
