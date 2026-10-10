export type Role = "admin" | "editor" | "viewer";

export type SiteSettings = {
  id: number;
  site_name: string;
  tagline: string;
  announcement: string | null;
  accent_color: string;
  discord_url: string | null;
  hero_title?: string;
  hero_highlight?: string;
  about_title?: string;
  about_description?: string;
};

export type GameMode = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  sort_order: number;
  enabled: boolean;
};

export type Tier = {
  id: string;
  code: string;
  label: string;
  color: string;
  points: number;
  sort_order: number;
};

export type Player = {
  id: string;
  minecraft_uuid: string;
  username: string;
  namemc_url: string | null;
  skin_url: string | null;
  region: string | null;
  created_at?: string;
};

export type Ranking = {
  id?: string;
  player_id: string;
  gamemode_id: string;
  tier_id: string | null;
  points: number;
  updated_at?: string;
};

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role?: Role;
};

export type PlayerView = Player & {
  rankings: Array<Ranking & { gamemode?: GameMode; tier?: Tier | null }>;
  totalPoints: number;
};
