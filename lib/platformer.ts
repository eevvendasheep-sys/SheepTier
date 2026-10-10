export const platformThemes = ["prairie", "desert", "sky"] as const;
export type PlatformTheme = typeof platformThemes[number];
export type PlatformLevel = { version: 1; width: number; height: 16; theme: PlatformTheme; tiles: number[] };
export const tileTools = [
  { tile: 0, name: "Gomme", icon: "×", group: "Terrain", description: "Efface une case. Le clic droit fonctionne aussi." },
  { tile: 1, name: "Herbe", icon: "🌱", group: "Terrain", description: "Un sol solide pour marcher et sauter." },
  { tile: 2, name: "Bloc", icon: "▣", group: "Terrain", description: "Une plateforme ou un mur solide." },
  { tile: 3, name: "Pics", icon: "▲", group: "Dangers", description: "À éviter : toucher les pointes fait perdre la tentative." },
  { tile: 4, name: "Pièce", icon: "●", group: "Objets", description: "Un bonus à ramasser ; les pièces ne sont pas obligatoires pour gagner." },
  { tile: 5, name: "Départ", icon: "🐑", group: "Objets", description: "Un seul départ, au-dessus d’un sol solide." },
  { tile: 6, name: "Arrivée", icon: "⚑", group: "Objets", description: "Atteins ce drapeau pour terminer le niveau, même en volant." },
  { tile: 7, name: "Tremplin", icon: "↟", group: "Terrain", description: "Propulse le mouton plus haut qu’un saut normal." },
  { tile: 8, name: "Loup", icon: "🐺", group: "Dangers", description: "Patrouille au sol sur deux cases de chaque côté. Saute sur sa tête pour l’éliminer ; toucher son côté est dangereux. Pose-le sur un sol." },
  { tile: 9, name: "Guêpe", icon: "🐝", group: "Dangers", description: "Ennemi volant qui oscille dans les airs. Évite-le ou écrase-le en retombant." },
  { tile: 10, name: "Lave", icon: "🔥", group: "Dangers", description: "Une case brûlante. Saute ou vole au-dessus." },
  { tile: 11, name: "Glace", icon: "❄", group: "Terrain", description: "Sol glissant : le mouton conserve son élan quand tu relâches la direction." },
  { tile: 12, name: "Bloc fragile", icon: "▧", group: "Terrain", description: "S’effondre 0,6 seconde après avoir marché dessus. Ne traîne pas !" },
  { tile: 13, name: "Portail vol", icon: "🪽", group: "Portails", description: "Transforme le mouton en mouton ailé : maintiens Espace / ↑ pour monter, relâche pour planer vers le bas. ↓ / S accélère la descente." },
  { tile: 14, name: "Portail normal", icon: "🐑", group: "Portails", description: "Rétablit les déplacements et la gravité habituels." },
  { tile: 15, name: "Portail lunaire", icon: "☾", group: "Portails", description: "Réduit la gravité pour des sauts plus hauts et une chute plus lente." },
  { tile: 16, name: "Clé", icon: "🔑", group: "Objets", description: "Ramasse une clé pour ouvrir une porte. Chaque clé ne se ramasse qu’une fois." },
  { tile: 17, name: "Porte", icon: "🚪", group: "Objets", description: "Bloque le passage. Une clé ouvre toutes les cases de porte reliées entre elles." },
  { tile: 18, name: "Checkpoint", icon: "📍", group: "Objets", description: "Point de retour automatique après une chute ou un piège. Les objets ramassés et les portes ouvertes restent acquis." },
  { tile: 19, name: "Portail vitesse", icon: "⚡", group: "Portails", description: "Accélère le mouton. Un autre portail remplace ce pouvoir." },
  { tile: 20, name: "Laser", icon: "↯", group: "Dangers", description: "Alterne 1,5 seconde allumé et 1,5 seconde éteint. Observe le rythme avant de passer." }
] as const;
export type MovementMode = "normal" | "flight" | "moon" | "speed";
export const movementNames: Record<MovementMode,string> = { normal: "Mouton", flight: "Vol", moon: "Gravité lunaire", speed: "Vitesse" };
export const solidTiles = [1, 2, 7, 11, 12];
export function tileAt(level: PlatformLevel, x: number, y: number) { return x < 0 || x >= level.width || y < 0 || y >= 16 ? 0 : level.tiles[Math.floor(y) * level.width + Math.floor(x)]; }
export function validateLevel(value: unknown, requireMarkers = true): PlatformLevel {
  if (!value || typeof value !== "object") throw new Error("Niveau invalide.");
  const v = value as Partial<PlatformLevel>;
  if (v.version !== 1 || v.height !== 16 || !Number.isInteger(v.width) || v.width! < 24 || v.width! > 96 || !platformThemes.includes(v.theme!) || !Array.isArray(v.tiles) || v.tiles.length !== v.width! * 16 || v.tiles.some(t => !Number.isInteger(t) || t < 0 || t > 20)) throw new Error("Le niveau doit mesurer 24 à 96 cases de large, avec 16 lignes et des blocs valides.");
  if (!requireMarkers) return { version: 1, width: v.width!, height: 16, theme: v.theme!, tiles: [...v.tiles] };
  if (v.tiles.filter(t=>t===8||t===9).length>40)throw new Error("Place au maximum 40 ennemis par niveau.");
  if (v.tiles.filter(t => t === 5).length !== 1 || v.tiles.filter(t => t === 6).length !== 1) throw new Error("Place exactement un départ et une arrivée.");
  const start = v.tiles.indexOf(5);
  const x = start % v.width!; const y = Math.floor(start / v.width!);
  if (y === 15 || !solidTiles.includes(v.tiles[start + v.width!]) || x === v.width! - 1) throw new Error("Place le départ au-dessus d’un sol ou d’un tremplin, avec un peu d’espace.");
  if(v.tiles.some((t,i)=>t===8&&(Math.floor(i/v.width!)===15||!solidTiles.includes(v.tiles![i+v.width!]))))throw new Error("Chaque loup doit être posé au-dessus d’un sol solide.");
  return { version: 1, width: v.width!, height: 16, theme: v.theme!, tiles: [...v.tiles] };
}
export function blankLevel(width = 64): PlatformLevel {
  const level: PlatformLevel = { version: 1, width, height: 16, theme: "prairie", tiles: Array(width * 16).fill(0) };
  for (let x = 0; x < width; x++) { level.tiles[14 * width + x] = 1; level.tiles[15 * width + x] = 2; }
  level.tiles[13 * width + 2] = 5; level.tiles[13 * width + width - 3] = 6;
  return level;
}
function setTile(level: PlatformLevel, x: number, y: number, tile: number) { level.tiles[y * level.width + x] = tile; }
function gap(level: PlatformLevel, start: number, length: number) { for (let x = start; x < start + length; x++) for (let y = 14; y < 16; y++) setTile(level, x, y, 0); }
function coins(level: PlatformLevel, xs: number[], y = 11) { xs.forEach(x => setTile(level, x, y, 4)); }
const first = blankLevel(56); gap(first, 16, 2); gap(first, 38, 2); [26, 27].forEach(x => setTile(first, x, 13, 3)); coins(first, [8, 9, 15, 16, 25, 26, 37, 38, 46]);
const second = blankLevel(68); second.theme = "desert"; gap(second, 18, 3); gap(second, 43, 3); setTile(second, 17, 14, 7); [30, 31, 54, 55].forEach(x => setTile(second, x, 13, 3)); [24, 25].forEach(x => setTile(second, x, 13, 2)); coins(second, [9, 17, 18, 19, 30, 42, 43, 55, 61], 10);
const third = blankLevel(64); third.theme = "sky"; third.tiles.fill(0);
for (const [start, end, y] of [[0,8,14],[10,18,13],[20,28,12],[30,38,13],[40,48,12],[50,58,13],[60,64,14]]) for(let x=start;x<end;x++){setTile(third,x,y,1);for(let j=y+1;j<16;j++)setTile(third,x,j,2);}
setTile(third, 2, 13, 5); setTile(third, 61, 13, 6); coins(third, [6, 14, 24, 34, 44, 54], 9);
export const campaignLevels = [
  { id: "prairie", title: "1 · Premiers bonds", description: "Apprends à sauter, ramasse les pièces et évite les pics.", level: first },
  { id: "desert", title: "2 · Le désert rebondissant", description: "Des fossés, des blocs et un tremplin pour prendre de la hauteur.", level: second },
  { id: "sky", title: "3 · Les îles du ciel", description: "Bondis de plateforme en plateforme jusqu’au drapeau.", level: third }
];
const flyingLesson=blankLevel(40);flyingLesson.theme="sky";gap(flyingLesson,10,17);setTile(flyingLesson,6,13,13);setTile(flyingLesson,37,13,0);setTile(flyingLesson,37,5,6);for(let x=34;x<40;x++)setTile(flyingLesson,x,6,2);coins(flyingLesson,[11,17,23,29],7);
const fortress=blankLevel(48);fortress.theme="desert";setTile(fortress,6,13,16);for(let y=11;y<=13;y++)setTile(fortress,12,y,17);setTile(fortress,17,13,18);for(let x=20;x<=23;x++)setTile(fortress,x,14,11);for(let x=26;x<=28;x++){setTile(fortress,x,14,12);setTile(fortress,x,15,0);}setTile(fortress,30,11,20);setTile(fortress,34,13,8);setTile(fortress,38,9,9);setTile(fortress,36,13,15);setTile(fortress,40,13,19);setTile(fortress,43,13,10);setTile(fortress,44,13,14);coins(fortress,[9,25],11);
export const editorTemplates=[{id:"flight",name:"L’école du vol",description:"Traverse le portail violet, puis rejoins le drapeau dans les airs.",level:flyingLesson},{id:"fortress",name:"La forteresse à clé",description:"Une porte, un checkpoint, de la glace, des ennemis et des pièges à combiner.",level:fortress}];
export type PlatformEnemy = { id:number;type:8|9;x:number;y:number;homeX:number;homeY:number;direction:number;defeated:boolean };
export type PlatformState = { x: number; y: number; vx: number; vy: number; grounded: boolean; dead: boolean; won: boolean; jumpHeld: boolean; coins: number[]; ticks: number; mode:MovementMode;keys:number;collectedKeys:number[];openedDoors:number[];broken:number[];crumbling:{id:number;at:number}[];checkpoint:{x:number;y:number;mode:MovementMode}|null;deaths:number;invincibleUntil:number;enemies:PlatformEnemy[] };
export function newPlatformState(level: PlatformLevel): PlatformState {
  const start = level.tiles.indexOf(5);
  return { x: start % level.width + .15, y: Math.floor(start / level.width) + .15, vx: 0, vy: 0, grounded: true, dead: false, won: false, jumpHeld: false, coins: [], ticks: 0,mode:"normal",keys:0,collectedKeys:[],openedDoors:[],broken:[],crumbling:[],checkpoint:null,deaths:0,invincibleUntil:0,enemies:level.tiles.flatMap((t,id)=>t===8||t===9?[{id,type:t,x:id%level.width+.12,y:Math.floor(id/level.width)+.25,homeX:id%level.width+.12,homeY:Math.floor(id/level.width)+.25,direction:1,defeated:false} as PlatformEnemy]:[]) };
}
function openDoor(level:PlatformLevel,s:PlatformState,id:number){const pending=[id],visited=new Set<number>();while(pending.length){const next=pending.pop()!;if(next<0||next>=level.tiles.length||visited.has(next)||level.tiles[next]!==17)continue;visited.add(next);const x=next%level.width;if(x>0)pending.push(next-1);if(x<level.width-1)pending.push(next+1);pending.push(next-level.width,next+level.width);}s.openedDoors.push(...visited);s.keys--;}
function solid(level:PlatformLevel,s:PlatformState,x:number,y:number,unlock=false){const t=tileAt(level,x,y),id=y*level.width+x;if(t===17){if(s.openedDoors.includes(id))return false;if(unlock&&s.keys>0){openDoor(level,s,id);return false;}return true;}return solidTiles.includes(t)&&!(t===12&&s.broken.includes(id));}
export function laserActive(ticks:number){return ticks%180<90;}
function hurt(s:PlatformState){if(s.ticks<s.invincibleUntil)return false;if(s.checkpoint){s.x=s.checkpoint.x;s.y=s.checkpoint.y;s.mode=s.checkpoint.mode;s.vx=0;s.vy=0;s.grounded=false;s.deaths++;s.invincibleUntil=s.ticks+60;}else s.dead=true;return true;}
function special(level:PlatformLevel,s:PlatformState){for(const cell of contacts(level,s)){if(cell.tile===13)s.mode="flight";if(cell.tile===14)s.mode="normal";if(cell.tile===15)s.mode="moon";if(cell.tile===19)s.mode="speed";if(cell.tile===16&&!s.collectedKeys.includes(cell.index)){s.collectedKeys.push(cell.index);s.keys++;}if(cell.tile===18)s.checkpoint={x:cell.x+.15,y:cell.y+.15,mode:s.mode};}}
function moveEnemies(level:PlatformLevel,s:PlatformState){for(const e of s.enemies){if(e.defeated)continue;if(e.type===8){const nx=e.x+e.direction*1.25/60;const lead=nx+(e.direction>0?.75:0);if(Math.abs(nx-e.homeX)>2||lead<0||lead>=level.width||solid(level,s,Math.floor(lead),Math.floor(e.y+.3))||!solid(level,s,Math.floor(lead),Math.floor(e.y+.76)))e.direction*=-1;else e.x=nx;}else{const phase=(s.ticks+e.id%120)%240;const triangle=phase<120?phase/120:(240-phase)/120;e.x=Math.max(0,Math.min(level.width-.75,e.homeX+(triangle-.5)*2));e.y=Math.max(.1,Math.min(14.9,e.homeY+(triangle-.5)*1.2));}}}
function contacts(level: PlatformLevel, state: PlatformState) {
  const cells: { x: number; y: number; tile: number; index: number }[] = [];
  for(let y=Math.floor(state.y+.001);y<=Math.floor(state.y+.85-.001);y++)for(let x=Math.floor(state.x+.001);x<=Math.floor(state.x+.65-.001);x++)cells.push({x,y,tile:tileAt(level,x,y),index:y*level.width+x});
  return cells;
}
// A fixed 60 Hz simulation is shared by the browser and publication validation.
// Input bits: left=1, right=2, jump/thrust=4, descend=8.
export function stepPlatform(level: PlatformLevel, s: PlatformState, input: number) {
  if (s.dead || s.won) return;
  s.ticks++;
  if(s.ticks>10800){s.dead=true;return;}
  s.crumbling=s.crumbling.filter(crumb=>{if(s.ticks>=crumb.at+36){s.broken.push(crumb.id);return false;}return true;});
  special(level,s);moveEnemies(level,s);
  const jump = !!(input & 4);
  if (s.mode!=="flight"&&jump && !s.jumpHeld && s.grounded) { s.vy = s.mode==="moon"?-9:-11.2; s.grounded = false; }
  s.jumpHeld = jump;
  const direction=((input & 2 ? 1 : 0) - (input & 1 ? 1 : 0)),desired=direction*(s.mode==="speed"?7.2:s.mode==="flight"?5.2:4.8);
  const onIce=s.grounded&&tileAt(level,s.x+.32,s.y+.87)===11;
  s.vx=onIce?(direction?s.vx+(desired-s.vx)*.055:s.vx*.99):desired;
  s.x = Math.max(0, Math.min(level.width - .65, s.x + s.vx / 60));
  for (const cell of contacts(level,s)) if (solid(level,s,cell.x,cell.y,true)) { if(s.vx>0)s.x=cell.x-.65;else if(s.vx<0)s.x=cell.x+1; }
  s.vy = s.mode==="flight"?(input&8?6:jump?-5.8:Math.min(6,s.vy+10/60)):Math.min(20,s.vy+(s.mode==="moon"?12:28)/60);
  const falling = s.vy >= 0,previousBottom=s.y+.85;
  s.y += s.vy / 60; s.grounded = false;
  if(s.y<0){s.y=0;s.vy=0;}
  for (const cell of contacts(level,s)) if (solid(level,s,cell.x,cell.y,true)) {
    if (falling) { s.y=cell.y-.85; s.vy=cell.tile===7?-15:0; s.grounded=cell.tile!==7; }
    else { s.y=cell.y+1; s.vy=0; }
    if(falling&&cell.tile===12&&!s.crumbling.some(c=>c.id===cell.index))s.crumbling.push({id:cell.index,at:s.ticks});
  }
  special(level,s);
  for(const enemy of s.enemies){if(enemy.defeated||s.x+.65<=enemy.x||s.x>=enemy.x+.75||s.y+.85<=enemy.y||s.y>=enemy.y+.75)continue;if(falling&&previousBottom<=enemy.y+.24){enemy.defeated=true;s.vy=-8;s.grounded=false;}else if(hurt(s))return;}
  for (const cell of contacts(level,s)) {
    if (cell.tile===3 && s.x+.56>cell.x+.12 && s.x+.09<cell.x+.88 && s.y+.82>cell.y+.22 && hurt(s))return;
    if((cell.tile===10||cell.tile===20&&laserActive(s.ticks))&&hurt(s))return;
    if (cell.tile===4 && !s.coins.includes(cell.index)) s.coins.push(cell.index);
    if (cell.tile===6) s.won=true;
  }
  if (s.y>16)hurt(s);
  if(s.ticks>10800)s.dead=true;
  if(s.dead)s.won=false;
}
export type PlatformReplay = [number, number][];
export function appendReplay(replay: PlatformReplay, mask: number) { const last=replay[replay.length-1];if(last?.[0]===mask)last[1]++;else replay.push([mask,1]); }
export function verifyReplay(level: PlatformLevel, value: unknown): boolean {
  if (!Array.isArray(value) || !value.length || value.length>10800) return false;
  let count=0;
  for(const pair of value){if(!Array.isArray(pair)||pair.length!==2||!Number.isInteger(pair[0])||pair[0]<0||pair[0]>15||!Number.isInteger(pair[1])||pair[1]<1)return false;count+=pair[1];if(count>10800)return false;}
  const state=newPlatformState(level);
  for(const [mask,frames] of value as PlatformReplay)for(let i=0;i<frames;i++){stepPlatform(level,state,mask);if(state.dead)return false;if(state.won)return true;}
  return false;
}
