export function parseMinecraftInput(input: string) {
  let value = input.trim();
  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    if (url.hostname !== 'namemc.com' && !url.hostname.endsWith('.namemc.com')) throw new Error("Le lien doit venir de NameMC.");
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] !== 'profile' || !parts[1]) throw new Error("Colle un lien de profil NameMC.");
    // NameMC adds a history suffix to both usernames and UUIDs.
    value = decodeURIComponent(parts[1]).replace(/\.\d+$/, '');
  }
  // NameMC sometimes appends the profile's history index to the UUID.
  const uuid = value.replace(/\.\d+$/, '').replace(/-/g, '');
  if (/^[a-f0-9]{32}$/i.test(uuid)) return { kind: 'uuid' as const, value: uuid.toLowerCase() };
  if (/^[A-Za-z0-9_]{1,16}$/.test(value)) return { kind: 'username' as const, value };
  throw new Error("Pseudo ou UUID Minecraft invalide.");
}
