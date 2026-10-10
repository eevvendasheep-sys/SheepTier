import { allSheepSkins, type SheepSkin } from "./sheep-rewards";
export const seasonalThemes = [
  { id: "classic", name: "Actuel", detail: "Le paysage original" },
  { id: "spring", name: "Printemps", detail: "Fleurs et pétales" },
  { id: "summer", name: "Été", detail: "Soleil et prairie dorée" },
  { id: "autumn", name: "Automne", detail: "Feuilles et couleurs chaudes" },
  { id: "winter", name: "Hiver", detail: "Neige et ciel glacé" },
  { id: "halloween", name: "Halloween", detail: "Citrouilles et lune violette" },
  { id: "christmas", name: "Noël", detail: "Sapins et guirlandes" }
] as const;
export const universeThemes = [
  { id: "blocklands", name: "Vallée des blocs", detail: "Creeper, abeille, panda…", sky: "#c9e8ed", middle: "#dceacc", ground: "#eaf0d7", accent: "#84a75b", skins: ["creeper", "pig", "bee", "zombie", "mushroom", "fox", "panda", "diamond"] },
  { id: "end", name: "Îles de l’End", detail: "Ender-mouton & dragon", sky: "#d8c9e6", middle: "#e5dded", ground: "#efeadf", accent: "#a582be", skins: ["ender", "dragon"] },
  { id: "redstonelab", name: "Labo redstone", detail: "Circuits lumineux", sky: "#e8d7d1", middle: "#ebe5da", ground: "#f0eadf", accent: "#c77c69", skins: ["redstone"] },
  { id: "ocean", name: "Îles pirates", detail: "Capitaine Bêê & Luffy", sky: "#cbeaf1", middle: "#d8ebeb", ground: "#efe7cb", accent: "#65a7bc", skins: ["pirate", "strawhat"] },
  { id: "ninjavillage", name: "Village ninja", detail: "Ninja de Kono-laine", sky: "#f1dfca", middle: "#eadfca", ground: "#f0e9d5", accent: "#bc8e66", skins: ["ninja"] },
  { id: "platform", name: "Royaume des tuyaux", detail: "Super Bêê-rio", sky: "#cce8f1", middle: "#e4edce", ground: "#f0efd9", accent: "#81aa68", skins: ["plumber"] },
  { id: "speedcoast", name: "Collines express", detail: "Sonicoton et les anneaux", sky: "#c8e7f3", middle: "#dceccf", ground: "#efe7ca", accent: "#5eaf9c", skins: ["speedy"] },
  { id: "pokeprairie", name: "Prairie électrique", detail: "Pika-laine", sky: "#d8e8f4", middle: "#e2eccb", ground: "#f3efcf", accent: "#c3ae51", skins: ["lightning"] },
  { id: "wizardcastle", name: "Château des sorciers", detail: "Bêê Potter", sky: "#d4d6ed", middle: "#e3e1ed", ground: "#eeeadf", accent: "#8f86b4", skins: ["wizard"] },
  { id: "galaxy", name: "Galaxie lointaine", detail: "Chevalier de la laine", sky: "#cbd4e9", middle: "#dde0ed", ground: "#e9e9f0", accent: "#8b9ac7", skins: ["spaceknight"] },
  { id: "nordic", name: "Fjord des bergers", detail: "Bêê-king", sky: "#d0e2ec", middle: "#e2e9e8", ground: "#edf0e9", accent: "#8da8b3", skins: ["viking"] },
  { id: "hauntedcity", name: "Ville paranormale", detail: "Bêê-stBuster", sky: "#d2e5da", middle: "#e0e8df", ground: "#eef0df", accent: "#8bad7c", skins: ["ghost"] },
  { id: "dreamland", name: "Pays des étoiles", detail: "Kirbêê", sky: "#f0d6e8", middle: "#eddfed", ground: "#f4e9dd", accent: "#d6a0bf", skins: ["kirby"] },
  { id: "london", name: "Londres brumeuse", detail: "Sherlock Bêê", sky: "#dae0e4", middle: "#e4e5dd", ground: "#eeeadf", accent: "#a59c8d", skins: ["detective"] },
  { id: "starship", name: "Vaisseau suspect", detail: "Imposteur laineux", sky: "#cbdce9", middle: "#dce5ed", ground: "#e9edf0", accent: "#8aa6bb", skins: ["among"] },
  { id: "spiritforest", name: "Forêt des esprits", detail: "Toto-laine", sky: "#d1e6df", middle: "#dfe9d4", ground: "#ebeedb", accent: "#86aa82", skins: ["totoro"] },
  { id: "moonpalace", name: "Palais lunaire", detail: "Sailor Laine", sky: "#ddd5ee", middle: "#e9e0ee", ground: "#f0e8ee", accent: "#a59bc9", skins: ["moon"] },
  { id: "webcity", name: "Ville aux toiles", detail: "Spider-Bêê", sky: "#d7e2f0", middle: "#e4e5ec", ground: "#efe8dd", accent: "#ab8c9e", skins: ["web"] },
  { id: "hyrule", name: "Collines d’Hyrulaine", detail: "Héros d’Hyrulaine", sky: "#d2e8e9", middle: "#dfe9ca", ground: "#eef0d7", accent: "#98ad69", skins: ["foresthero"] },
  { id: "saiyanarena", name: "Arène des nuages", detail: "Super Saiya-laine", sky: "#d2e5f3", middle: "#f0e0ca", ground: "#f3e8d1", accent: "#c5a073", skins: ["saiyan"] },
  { id: "gotham", name: "Gotham pastel", detail: "Dark Bêê", sky: "#c9d2e0", middle: "#dbe0e8", ground: "#e8e8ec", accent: "#8d98af", skins: ["bat"] }
] as const;
export type UniverseTheme = typeof universeThemes[number]["id"];
export const worldThemes = [...seasonalThemes, ...universeThemes];
export function themeForSkin(skin: SheepSkin) { return universeThemes.find(theme => (theme.skins as readonly string[]).includes(skin)); }
export type WorldTheme = typeof worldThemes[number]["id"];
export const woolColors = [
  { name: "Blanc", color: "#fffdf0" }, { name: "Orange", color: "#e98731" },
  { name: "Magenta", color: "#bf55bd" }, { name: "Bleu clair", color: "#68b5d4" },
  { name: "Jaune", color: "#edcc43" }, { name: "Vert clair", color: "#91bd40" },
  { name: "Rose", color: "#eaa0b2" }, { name: "Gris", color: "#555b5e" },
  { name: "Gris clair", color: "#aaaead" }, { name: "Cyan", color: "#308f9c" },
  { name: "Violet", color: "#8451b4" }, { name: "Bleu", color: "#455bae" },
  { name: "Marron", color: "#856043" }, { name: "Vert", color: "#5c7734" },
  { name: "Rouge", color: "#b8443e" }, { name: "Noir", color: "#303337" }
];
export type Appearance = { theme: WorldTheme; wool: string; animated: boolean; skin: SheepSkin };
export const defaultAppearance: Appearance = { theme: "classic", wool: "#fffdf0", animated: true, skin: "classic" };
export function parseAppearance(value: unknown): Appearance {
  const input = value && typeof value === "object" ? value as Partial<Appearance> : {};
  return {
    skin: allSheepSkins.some(skin => skin.id === input.skin) ? input.skin! : "classic",
    theme: worldThemes.some(theme => theme.id === input.theme) ? input.theme! : "classic",
    wool: typeof input.wool === "string" && /^#[0-9a-f]{6}$/i.test(input.wool) ? input.wool.toLowerCase() : defaultAppearance.wool,
    animated: typeof input.animated === "boolean" ? input.animated : true
  };
}
