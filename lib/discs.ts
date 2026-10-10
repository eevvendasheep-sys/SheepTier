export const minecraftDiscs = [
  { name: "Creator", url: "/audio/creator.mp3" },
  { name: "Aria Math", url: "/audio/aria-math.mp3" },
  { name: "Sweden", url: "/audio/sweden.mp3" },
  { name: "Mice on Venus", url: "/audio/mice-on-venus.mp3" }
];

/** Every track plays once per shuffle; cycle boundaries never repeat a track. */
export function shuffledDiscIndices(count: number, previous = -1, random = Math.random) {
  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  if (count > 1 && indices[0] === previous) [indices[0], indices[1]] = [indices[1], indices[0]];
  return indices;
}
