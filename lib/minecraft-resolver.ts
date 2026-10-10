import { parseMinecraftInput } from "./minecraft";

export type MinecraftIdentity = {
  uuid: string; username: string; namemcUrl: string; skinUrl: string | null;
  avatarUrl: string; bodyUrl: string;
};
type Lookup = ReturnType<typeof parseMinecraftInput>;
export type LookupDiagnostic = { provider: string; outcome: string; status?: number; error?: string };
export class MinecraftLookupError extends Error {
  constructor(message: string, public status: number, public diagnostics: LookupDiagnostic[]) { super(message); }
}

function normalizeProfile(raw: any, lookup: Lookup): MinecraftIdentity | null {
  if (!raw || typeof raw.id !== 'string' || typeof raw.name !== 'string') return null;
  const uuid = raw.id.replace(/-/g, '').toLowerCase();
  const username = raw.name;
  if (!/^[0-9a-f]{32}$/.test(uuid) || !/^[A-Za-z0-9_]{1,16}$/.test(username)) return null;
  if (lookup.kind === 'uuid' && uuid !== lookup.value) return null;
  if (lookup.kind === 'username' && username.toLowerCase() !== lookup.value.toLowerCase()) return null;
  let skinUrl: string | null = null;
  try {
    const texture = Array.isArray(raw.properties) ? raw.properties.find((p: any) => p?.name === 'textures') : null;
    if (typeof texture?.value === 'string') {
      const url = new URL(JSON.parse(atob(texture.value))?.textures?.SKIN?.url);
      if (url.hostname === 'textures.minecraft.net' && ['https:', 'http:'].includes(url.protocol)) skinUrl = url.href;
    }
  } catch { /* Texture metadata is optional: UUID-based rendering still works. */ }
  return { uuid, username, namemcUrl: `https://namemc.com/profile/${username}`, skinUrl,
    avatarUrl: `https://mc-heads.net/avatar/${uuid}/128`, bodyUrl: `https://mc-heads.net/body/${uuid}/right/180` };
}

export async function resolveMinecraftProfile(
  input: string,
  fetcher: typeof fetch = (input, init) => globalThis.fetch(input, init),
  onDiagnostic: (diagnostic: LookupDiagnostic) => void = () => {},
): Promise<MinecraftIdentity> {
  const lookup = parseMinecraftInput(input);
  const identifier = encodeURIComponent(lookup.value);
  // Use fixed provider origins: user-provided links are never fetched directly.
  const providers = lookup.kind === 'username' ? [
    { name: 'minecraftservices', url: `https://api.minecraftservices.com/minecraft/profile/lookup/name/${identifier}` },
    { name: 'mojang', url: `https://api.mojang.com/users/profiles/minecraft/${identifier}` },
    { name: 'crafthead', url: `https://crafthead.net/profile/${identifier}` },
  ] : [
    { name: 'mojang-session', url: `https://sessionserver.mojang.com/session/minecraft/profile/${identifier}` },
    { name: 'minecraftservices', url: `https://api.minecraftservices.com/minecraft/profile/lookup/${identifier}` },
    { name: 'crafthead', url: `https://crafthead.net/profile/${identifier}` },
  ];
  const diagnostics: LookupDiagnostic[] = [];
  const record = (diagnostic: LookupDiagnostic) => { diagnostics.push(diagnostic); onDiagnostic(diagnostic); };
  for (const provider of providers) {
    let status: number | undefined;
    try {
      const response = await fetcher(provider.url, {
        headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000), redirect: 'manual',
      });
      status = response.status;
      if (status === 204 || status === 404) { record({ provider: provider.name, outcome: 'not_found', status }); continue; }
      if (!response.ok) { record({ provider: provider.name, outcome: status === 429 ? 'rate_limited' : 'upstream_error', status }); continue; }
      const identity = normalizeProfile(await response.json(), lookup);
      if (!identity) { record({ provider: provider.name, outcome: 'invalid_profile', status }); continue; }
      record({ provider: provider.name, outcome: 'success', status });
      return identity;
    } catch (error) {
      record({ provider: provider.name, outcome: error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name) ? 'timeout' : 'fetch_or_parse_error', ...(status ? { status } : {}), error: error instanceof Error ? `${error.name}: ${error.message}`.slice(0, 200) : 'Unknown upstream error' });
    }
  }
  if (diagnostics.every(d => d.outcome === 'not_found'))
    throw new MinecraftLookupError("Joueur Minecraft introuvable. Vérifie le pseudo ou utilise son UUID NameMC.", 404, diagnostics);
  if (diagnostics.every(d => d.outcome === 'rate_limited'))
    throw new MinecraftLookupError("Les services de profils reçoivent trop de demandes. Réessaie dans un instant.", 429, diagnostics);
  throw new MinecraftLookupError("Impossible de récupérer ce profil auprès des services Minecraft. Réessaie dans un instant.", 502, diagnostics);
}
