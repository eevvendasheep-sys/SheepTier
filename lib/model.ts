import type { SiteDocument } from "./store";
import type { Role } from "./types";
export type Operation = { table: string; operation: string; payload?: any;
  filters?: Record<string, unknown>; sort?: string; one?: boolean };
export class APIError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
const fail = (message: string): never => { throw new APIError(message); };
const text = (value: unknown, max = 160, required = false) => {
  if (typeof value !== "string" && value != null) fail("Texte invalide.");
  const result = String(value ?? "").trim();
  if (result.length > max || (required && !result)) fail("Vérifie les champs obligatoires et leur longueur.");
  return result;
};
const number = (value: unknown, max = 1000000) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > max) fail("Nombre invalide.");
  return n;
};
const color = (value: unknown) => {
  const result = text(value, 7); if (!/^#[0-9a-f]{6}$/i.test(result)) fail("Couleur invalide."); return result;
};
function safeURL(value: unknown, internal = false) {
  const result = text(value, 2048);
  if (!result) return null;
  if (internal && ((/^\/api\/logos\?path=/.test(result) || /^\/api\/logos\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(result)) || /^\/gamemodes\/[a-z]+\.svg$/.test(result))) return result;
  let url: URL;
  try { url = new URL(result); } catch { return fail("Lien invalide."); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) fail("Le lien doit utiliser HTTP ou HTTPS.");
  return result;
}
const allowed = ['site_settings', 'gamemodes', 'tiers', 'players', 'rankings', 'user_roles', 'admin_users_view'];
function validateInput(query: Operation) {
  if (!query || !allowed.includes(query.table) || !['select', 'insert', 'upsert', 'update', 'delete'].includes(query.operation)) fail("Opération inconnue.");
  if (query.filters && (typeof query.filters !== 'object' || Array.isArray(query.filters) || Object.keys(query.filters).length > 4)) fail("Filtres invalides.");
}
function roleFor(doc: SiteDocument, userId: string | undefined, owner: string | null): Role {
  return userId && userId === owner ? 'admin' : 'viewer';
}
export function applyOperation(doc: SiteDocument, query: Operation, userId: string | undefined, owner: string | null): any {
  validateInput(query);
  const role = roleFor(doc, userId, owner);
  const filters = query.filters || {};
  const matches = (row: any) => Object.entries(filters).every(([key, value]) => Object.hasOwn(row, key) && row[key] === value);
  if (query.operation === 'select') {
    let rows: any[];
    if (query.table === 'admin_users_view') {
      if (role !== 'admin') throw new APIError("Accès réservé aux administrateurs.", 403);
      rows = doc.users.map(u => ({ ...u, role: u.id === owner ? 'admin' : 'viewer' }));
    } else if (query.table === 'user_roles') {
      if (!userId) throw new APIError("Connecte-toi pour consulter tes droits.", 401);
      rows = doc.users.filter(u => role === 'admin' || u.id === userId).map(u => ({ user_id: u.id, role: u.id === owner ? 'admin' : 'viewer' }));
    } else rows = doc[query.table as keyof SiteDocument] as any[];
    rows = rows.filter(matches).map(row => ({ ...row }));
    if (query.sort) { const key = query.sort; rows.sort((a, b) => typeof a[key] === 'number' ? a[key] - b[key] : String(a[key] ?? '').localeCompare(String(b[key] ?? ''))); }
    return query.one ? rows[0] ?? null : rows;
  }
  if (!userId) throw new APIError("Connecte-toi pour modifier le site.", 401);
  if (role !== 'admin' && role !== 'editor') throw new APIError("Ton compte est en lecture seule.", 403);
  if (query.table === 'admin_users_view') fail("Cette liste n'est pas modifiable.");
  const payload = query.payload;
  if (query.table === 'user_roles') {
    if (role !== 'admin') throw new APIError("Seuls les admins peuvent gérer les accès.", 403);
    if (query.operation !== 'upsert' || !payload || !['admin', 'editor', 'viewer'].includes(payload.role)) fail("Rôle invalide.");
    const account = doc.users.find(u => u.id === payload.user_id);
    if (!account) throw new APIError("Ce compte doit d'abord se connecter au site.");
    if (account.id === owner && payload.role !== 'admin') fail("Le propriétaire conserve toujours son accès administrateur.");
    if (account.id !== owner && payload.role !== 'viewer') fail("Seul le propriétaire peut administrer ce site.");
    account.role = payload.role;
    return { user_id: account.id, role: account.role };
  }
  const table = query.table as Exclude<keyof SiteDocument, 'users'>;
  const rows = doc[table] as any[];
  if (query.operation === 'delete') {
    if (table === 'site_settings' || !Object.keys(filters).length) fail("Sélectionne un élément à supprimer.");
    const deleted = rows.filter(matches);
    if (!deleted.length) return null;
    (doc[table] as any[]) = rows.filter(row => !matches(row));
    const ids = deleted.map(r => r.id);
    if (table === 'players') doc.rankings = doc.rankings.filter(r => !ids.includes(r.player_id));
    if (table === 'gamemodes') doc.rankings = doc.rankings.filter(r => !ids.includes(r.gamemode_id));
    if (table === 'tiers') doc.rankings = doc.rankings.filter(r => !ids.includes(r.tier_id));
    return null;
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) fail("Données invalides.");
  let existing: any;
  if (query.operation === 'update') {
    if (!Object.keys(filters).length) fail("Sélectionne un élément à modifier.");
    const found = rows.filter(matches);
    if (found.length !== 1) fail("Élément introuvable.");
    existing = found[0];
  } else if (query.operation === 'upsert') {
    existing = table === 'site_settings' ? rows[0] : table === 'rankings'
      ? rows.find(r => r.player_id === payload.player_id && r.gamemode_id === payload.gamemode_id)
      : rows.find(r => r.id === payload.id);
  }
  const input = { ...existing, ...payload };
  const row: any = { id: existing?.id || crypto.randomUUID() };
  switch (table) {
    case 'site_settings':
      Object.assign(row, { id: 1, site_name: text(input.site_name, 50, true), tagline: text(input.tagline, 500, true),
        announcement: text(input.announcement, 240) || null, accent_color: color(input.accent_color), discord_url: safeURL(input.discord_url),
        hero_title: text(input.hero_title, 100), hero_highlight: text(input.hero_highlight, 100),
        about_title: text(input.about_title, 120), about_description: text(input.about_description, 800) });
      break;
    case 'gamemodes':
      Object.assign(row, { name: text(input.name, 60, true), slug: text(input.slug, 80, true), description: text(input.description, 500) || null,
        logo_url: safeURL(input.logo_url, true), sort_order: number(input.sort_order || 0, 10000), enabled: input.enabled !== false });
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug)) fail("Le slug doit contenir des lettres minuscules, chiffres et tirets.");
      if (rows.some(r => r.id !== row.id && r.slug === row.slug)) fail("Un gamemode utilise déjà ce slug.");
      break;
    case 'tiers':
      Object.assign(row, { code: text(input.code, 12, true).toUpperCase(), label: text(input.label, 100, true), color: color(input.color),
        points: number(input.points), sort_order: number(input.sort_order || 0, 10000) });
      if (rows.some(r => r.id !== row.id && r.code === row.code)) fail("Ce tier existe déjà.");
      break;
    case 'players':
      Object.assign(row, { minecraft_uuid: text(input.minecraft_uuid, 32, true).toLowerCase(), username: text(input.username, 16, true),
        namemc_url: safeURL(input.namemc_url), skin_url: safeURL(input.skin_url), region: text(input.region, 20) || null });
      if (!/^[0-9a-f]{32}$/.test(row.minecraft_uuid) || !/^[A-Za-z0-9_]{1,16}$/.test(row.username)) fail("Profil Minecraft invalide.");
      if (rows.some(r => r.id !== row.id && r.minecraft_uuid === row.minecraft_uuid)) fail("Ce joueur est déjà dans le classement.");
      break;
    case 'rankings': {
      const tier = doc.tiers.find(t => t.id === input.tier_id);
      if (!tier || !doc.players.some(p => p.id === input.player_id) || !doc.gamemodes.some(g => g.id === input.gamemode_id)) throw new APIError("Joueur, gamemode ou tier introuvable.");
      Object.assign(row, { player_id: input.player_id, gamemode_id: input.gamemode_id, tier_id: tier.id, points: tier.points });
      if (!existing && rows.some(r => r.player_id === row.player_id && r.gamemode_id === row.gamemode_id)) fail("Ce joueur a déjà un tier dans ce mode.");
      break;
    }
  }
  if (existing) rows.splice(rows.indexOf(existing), 1, row); else rows.push(row);
  if (table === 'tiers') doc.rankings = doc.rankings.map(r => r.tier_id === row.id ? { ...r, points: row.points } : r);
  return query.one ? row : [row];
}
