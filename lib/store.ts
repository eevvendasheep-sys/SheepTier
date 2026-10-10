import { env } from "@/lib/netlify-env";
import { demoSettings, demoModes, demoTiers } from "./demo";
import type { SiteSettings, GameMode, Tier, Player, Ranking, Profile } from "./types";
export type SiteDocument = {
  admin_player_id?: string;
  site_settings: SiteSettings[]; gamemodes: GameMode[]; tiers: Tier[];
  players: Player[]; rankings: Ranking[]; users: Profile[];
};
export function initialDocument(): SiteDocument {
  return { site_settings: [{ ...demoSettings, announcement: "Bienvenue sur SheepTier", discord_url: null }],
    gamemodes: structuredClone(demoModes), tiers: structuredClone(demoTiers), players: [], rankings: [], users: [] };
}
export async function readDocument() {
  if (!env.DB) throw new Error("La base de données est indisponible.");
  await env.DB.prepare("INSERT OR IGNORE INTO site_state (id, revision, document) VALUES (1, 0, ?)")
    .bind(JSON.stringify(initialDocument())).run();
  const row = await env.DB.prepare("SELECT revision, document FROM site_state WHERE id = 1").first<{ revision: number; document: string }>();
  if (!row) throw new Error("Chargement impossible.");
  return { revision: row.revision, document: JSON.parse(row.document) as SiteDocument };
}
export async function changeDocument<T>(change: (doc: SiteDocument) => T): Promise<T> {
  for (let retry = 0; retry < 5; retry++) {
    const { revision, document } = await readDocument();
    const output = change(document);
    const serialized = JSON.stringify(document);
    if (serialized.length > 4_000_000) throw new Error("Le classement atteint sa capacité.");
    const result = await env.DB!.prepare("UPDATE site_state SET document = ?, revision = revision + 1 WHERE id = 1 AND revision = ?")
      .bind(serialized, revision).run();
    if (result.meta.changes === 1) return output;
  }
  throw new Error("Une autre modification est en cours. Réessaie.");
}
export async function ownerId() {
  const row = await env.DB!.prepare("SELECT user_id FROM site_owner WHERE id = 1").first<{ user_id: string }>();
  return row?.user_id ?? null;
}
export async function registerUser(user: { userId: string; email: string; displayName: string }) {
  // Public registration never assigns ownership, even on an empty database.
  const owner = await ownerId();
  if (!owner) throw new Error("Le compte propriétaire n’est pas encore configuré.");
  await changeDocument(doc => {
    const existing = doc.users.find(p => p.id === user.userId);
    if (existing) { existing.email = user.email; existing.display_name = user.displayName; existing.role = user.userId === owner ? "admin" : "viewer"; }
    else doc.users.push({ id: user.userId, email: user.email, display_name: user.displayName,
      role: user.userId === owner ? "admin" : "viewer" });
  });
}
