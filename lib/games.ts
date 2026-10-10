import { parseOwnedSkins, type SheepSkin } from "./sheep-rewards";
export type RunnerState = { time: number; y: number; velocity: number; spawn: number; obstacles: { x: number; skin: number }[]; over: boolean };
export const newRunner = (): RunnerState => ({ time: 0, y: 0, velocity: 0, spawn: 1.5, obstacles: [], over: false });
export function jumpRunner(state: RunnerState) {
  if (!state.over && state.y === 0) state.velocity = -620;
}
export function stepRunner(state: RunnerState, seconds: number, skins: number, random = Math.random) {
  if (state.over) return;
  const dt = Math.min(.04, Math.max(0, seconds));
  state.time += dt;
  state.velocity += 1750 * dt;
  state.y = Math.min(0, state.y + state.velocity * dt);
  if (state.y === 0) state.velocity = 0;
  const speed = Math.min(510, 285 + state.time * 3);
  state.spawn -= dt;
  if (state.spawn <= 0) {
    state.obstacles.push({ x: 920, skin: Math.floor(random() * Math.max(1, skins)) });
    state.spawn = 1.5 + random() * .65;
  }
  for (const obstacle of state.obstacles) {
    obstacle.x -= speed * dt;
    // Forgiving boxes exclude wool edges and transparent skin pixels.
    if (obstacle.x + 30 > 96 && obstacle.x + 8 < 130 && 240 + state.y > 181) state.over = true;
  }
  state.obstacles = state.obstacles.filter(obstacle => obstacle.x > -70);
}

export const farmUpgrades = [
  { name: "Gants du berger", description: "+2 blés par clic", cost: 15, click: 2, rate: 0, icon: "🌾" },
  { name: "Mouton récolteur", description: "+1 blé par seconde", cost: 60, click: 0, rate: 1, icon: "🐑" },
  { name: "Prairie fertile", description: "+6 blés par seconde", cost: 300, click: 0, rate: 6, icon: "🌱" },
  { name: "Berger du village", description: "+25 blés par seconde", cost: 1500, click: 0, rate: 25, icon: "🧑‍🌾" },
  { name: "Moulin à laine", description: "+120 blés par seconde", cost: 8000, click: 0, rate: 120, icon: "🧶" }
];
export type FarmState = { wheat: number; total: number; levels: number[]; ownedSkins: SheepSkin[] };
export const newFarm = (): FarmState => ({ wheat: 0, total: 0, levels: farmUpgrades.map(() => 0), ownedSkins: [] });
export const farmRate = (state: FarmState) => state.levels.reduce((sum, level, i) => sum + level * farmUpgrades[i].rate, 0);
export const farmClick = (state: FarmState) => 1 + state.levels.reduce((sum, level, i) => sum + level * farmUpgrades[i].click, 0);
export const upgradeCost = (state: FarmState, i: number) => Math.min(1e15, Math.ceil(farmUpgrades[i].cost * 1.18 ** state.levels[i]));
export function addWheat(state: FarmState, amount: number): FarmState {
  return { ...state, wheat: Math.min(1e15, state.wheat + amount), total: Math.min(1e15, state.total + amount) };
}
export function advanceFarm(state: FarmState, seconds: number) { return addWheat(state, farmRate(state) * Math.max(0, Math.min(8 * 3600, seconds))); }
export function buyUpgrade(state: FarmState, i: number): FarmState {
  if (!farmUpgrades[i]) return state;
  const cost = upgradeCost(state, i);
  if (state.wheat < cost || state.levels[i] >= 1000) return state;
  const levels = [...state.levels]; levels[i]++;
  return { ...state, wheat: state.wheat - cost, levels };
}
export function parseFarm(value: unknown): FarmState {
  if (!value || typeof value !== "object") return newFarm();
  const v = value as Partial<FarmState>;
  const number = (n: unknown, max: number) => typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0;
  return { wheat: number(v.wheat, 1e15), total: number(v.total, 1e15), levels: farmUpgrades.map((_, i) => Math.floor(number(v.levels?.[i], 1000))), ownedSkins: parseOwnedSkins(v.ownedSkins) };
}
export function makeMemoryDeck(random = Math.random) {
  const deck = Array.from({ length: 16 }, (_, i) => i % 8);
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck;
}
