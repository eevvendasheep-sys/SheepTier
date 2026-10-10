export const sheepSkins = [
  { id: "classic", name: "Classique", goal: "Disponible dès le départ", game: "runner", target: 0 },
  { id: "hero", name: "Super-mouton", goal: "Sheep Run : atteindre 100 points", game: "runner", target: 100 },
  { id: "astronaut", name: "Astro-mouton", goal: "Sheep Run : atteindre 300 points", game: "runner", target: 300 },
  { id: "farmer", name: "Petit fermier", goal: "Blé Clicker : récolter 100 blés au total", game: "wheat", target: 100 },
  { id: "royal", name: "Roi de la prairie", goal: "Blé Clicker : récolter 10 000 blés au total", game: "wheat", target: 10000 },
  { id: "flower", name: "Mouton fleuri", goal: "Moutons jumeaux : terminer une partie", game: "memory", target: 1000000 },
  { id: "rainbow", name: "Arc-en-ciel", goal: "Moutons jumeaux : gagner en 12 essais ou moins", game: "memory", target: 12 }
] as const;
export const shopSkins = [
  { id: "creeper", name: "Creeper laineux", reference: "Minecraft · attention au sss…", price: 150, color: "#77af4f", accent: "#314f2c" },
  { id: "pig", name: "Cochon du pâturage", reference: "Minecraft · un cousin rose", price: 250, color: "#eea6b1", accent: "#c47d8b" },
  { id: "bee", name: "Butineur", reference: "Minecraft · miel et petites ailes", price: 400, color: "#e7bf48", accent: "#514434" },
  { id: "zombie", name: "Mouton zombie", reference: "Minecraft · la nuit lui appartient", price: 650, color: "#5b9c76", accent: "#52679f" },
  { id: "mushroom", name: "Champi-mouton", reference: "Minecraft · biome champignon", price: 900, color: "#c9574c", accent: "#fff2da" },
  { id: "fox", name: "Renard des blocs", reference: "Minecraft · rusé sous sa laine", price: 1200, color: "#d88b45", accent: "#fff2dd" },
  { id: "panda", name: "Panda cubique", reference: "Minecraft · fan de bambou", price: 1600, color: "#f1efe4", accent: "#343f40" },
  { id: "redstone", name: "Ingénieur redstone", reference: "Minecraft · circuits et leviers", price: 2200, color: "#74675e", accent: "#e95950" },
  { id: "pirate", name: "Capitaine Bêê", reference: "Pirates · trésor de la prairie", price: 3000, color: "#b64e4e", accent: "#313c49" },
  { id: "ninja", name: "Ninja de Kono-laine", reference: "Naruto · bandeau et tenue orange", price: 4000, color: "#ea9944", accent: "#374a71" },
  { id: "plumber", name: "Super Bêê-rio", reference: "Mario · casquette et salopette", price: 5500, color: "#da5146", accent: "#447eac" },
  { id: "speedy", name: "Sonicoton", reference: "Sonic · piquants bleus, sabots rouges", price: 7000, color: "#4283ca", accent: "#dc5b4f" },
  { id: "lightning", name: "Pika-laine", reference: "Pokémon · joues rouges et éclair", price: 9000, color: "#e9cd4d", accent: "#e36a53" },
  { id: "wizard", name: "Bêê Potter", reference: "Harry Potter · lunettes et écharpe", price: 12000, color: "#514b64", accent: "#dfb256" },
  { id: "spaceknight", name: "Chevalier de la laine", reference: "Star Wars · cape et sabre lumineux", price: 16000, color: "#c3ae8d", accent: "#69d2af" },
  { id: "viking", name: "Bêê-king", reference: "Fantasy · casque à cornes", price: 21000, color: "#936b4e", accent: "#b9c9cc" },
  { id: "ghost", name: "Bêê-stBuster", reference: "Ghostbusters · fantôme vert et sac à dos", price: 28000, color: "#c7b696", accent: "#8ec76d" },
  { id: "ender", name: "Ender-mouton", reference: "Minecraft · regard violet de l’End", price: 36000, color: "#393744", accent: "#c883e3" },
  { id: "diamond", name: "Armure diamant", reference: "Minecraft · équipement de prestige", price: 48000, color: "#75ccd3", accent: "#e1f9f2" },
  { id: "dragon", name: "Dragon de la prairie", reference: "Minecraft · ailes de l’Ender Dragon", price: 65000, color: "#4c4359", accent: "#c083d7" },
  { id: "kirby", name: "Kirbêê", reference: "Kirby · rose, étoiles et petits pieds", price: 500, color: "#ed9fc2", accent: "#cf527c" },
  { id: "detective", name: "Sherlock Bêê", reference: "Sherlock Holmes · enquête au pâturage", price: 1800, color: "#b89b76", accent: "#685446" },
  { id: "among", name: "Imposteur laineux", reference: "Among Us · combinaison rouge et visière", price: 3500, color: "#d35c58", accent: "#9bd5e4" },
  { id: "totoro", name: "Toto-laine", reference: "Totoro · esprit tout doux de la forêt", price: 6000, color: "#929b9a", accent: "#ebe6d2" },
  { id: "strawhat", name: "Bêê au chapeau de paille", reference: "One Piece · Luffy et son trésor", price: 8500, color: "#e5c092", accent: "#cd5546" },
  { id: "moon", name: "Sailor Laine", reference: "Sailor Moon · lune et nœud marin", price: 11500, color: "#f4eee4", accent: "#596fa9" },
  { id: "web", name: "Spider-Bêê", reference: "Spider-Man · toile et tenue rouge et bleue", price: 15000, color: "#d45555", accent: "#477ba8" },
  { id: "foresthero", name: "Héros d’Hyrulaine", reference: "Zelda · Link, bonnet vert et bouclier", price: 20000, color: "#739553", accent: "#d7c6a0" },
  { id: "saiyan", name: "Super Saiya-laine", reference: "Dragon Ball · Goku et ses cheveux dorés", price: 30000, color: "#e6a04d", accent: "#4865a0" },
  { id: "bat", name: "Dark Bêê", reference: "Batman · masque, cape et ceinture", price: 45000, color: "#626a76", accent: "#e4bf54" }
] as const;
export const allSheepSkins = [...sheepSkins, ...shopSkins.map(s => ({ ...s, goal: `Boutique : ${s.price.toLocaleString("fr-FR")} blés` }))];
export type SheepSkin = typeof sheepSkins[number]["id"] | typeof shopSkins[number]["id"];
export function parseOwnedSkins(value: unknown): SheepSkin[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is typeof shopSkins[number]["id"] => shopSkins.some(s => s.id === id)))] : [];
}
export function buyShopSkin<T extends { wheat: number; ownedSkins: SheepSkin[] }>(farm: T, id: SheepSkin): T {
  const skin = shopSkins.find(s => s.id === id);
  if (!skin || !Number.isFinite(farm.wheat) || farm.wheat < skin.price || farm.ownedSkins.includes(id)) return farm;
  return { ...farm, wheat: farm.wheat - skin.price, ownedSkins: [...farm.ownedSkins, id] };
}
export type RewardProgress = { runner: number; wheat: number; memory: number };
export const rewardEvent = "sheeptier-rewards-changed";
const key = "sheeptier-sheep-rewards";
const empty: RewardProgress = { runner: 0, wheat: 0, memory: 0 };
const positive = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.min(1e15, v) : 0;
export function parseRewards(value: unknown): RewardProgress {
  const v = value && typeof value === "object" ? value as Partial<RewardProgress> : {};
  const memory = positive(v.memory);
  return { runner: Math.floor(positive(v.runner)), wheat: positive(v.wheat), memory: memory >= 8 && Number.isInteger(memory) ? memory : 0 };
}
export function mergeRewards(a: RewardProgress, b: RewardProgress): RewardProgress {
  return { runner: Math.max(a.runner, b.runner), wheat: Math.max(a.wheat, b.wheat), memory: a.memory && b.memory ? Math.min(a.memory, b.memory) : a.memory || b.memory };
}
export function unlockedSkins(p: RewardProgress): SheepSkin[] {
  return sheepSkins.filter(s => s.id === "classic" || (s.game === "memory" ? p.memory >= 8 && (s.id === "flower" || p.memory <= s.target) : p[s.game] >= s.target)).map(s => s.id);
}
let cached = { ...empty };
function read(key: string): any { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; } }
export function getRewards(): RewardProgress {
  cached = mergeRewards(cached, parseRewards(read(key)));
  return { ...cached };
}
export function availableSkins(): SheepSkin[] {
  return [...unlockedSkins(getRewards()), ...parseOwnedSkins(read("sheeptier-wheat-farm")?.farm?.ownedSkins)];
}
function persist(next: RewardProgress, announce: boolean) {
  const old = getRewards();
  cached = mergeRewards(old, next);
  try { localStorage.setItem(key, JSON.stringify(cached)); } catch {}
  const newlyUnlocked = unlockedSkins(cached).filter(id => !unlockedSkins(old).includes(id));
  if (typeof window !== "undefined" && (newlyUnlocked.length || JSON.stringify(old) !== JSON.stringify(cached))) {
    window.dispatchEvent(new CustomEvent(rewardEvent, { detail: { newlyUnlocked: announce ? newlyUnlocked : [] } }));
  }
  return { ...cached };
}
export function importGameRewards() {
  return persist(parseRewards({ runner: read("sheeptier-run-best"), wheat: read("sheeptier-wheat-farm")?.farm?.total, memory: read("sheeptier-memory-best") }), false);
}
export function recordReward(game: keyof RewardProgress, value: number) {
  return persist(parseRewards({ ...empty, [game]: value }), true);
}
