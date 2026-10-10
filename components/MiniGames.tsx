"use client";
import CommunityNav from "./CommunityNav";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Gift, Pause, Play, RotateCcw, Trophy, Wheat, ShoppingBag } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { NoteBlock } from "./WorldExperience";
import { getSiteClient } from "@/lib/site-client";
import type { Player, Ranking } from "@/lib/types";
import { addWheat, advanceFarm, buyUpgrade, farmClick, farmRate, farmUpgrades, jumpRunner, makeMemoryDeck, newFarm, newRunner, parseFarm, stepRunner, upgradeCost, type FarmState } from "@/lib/games";
import { woolColors, themeForSkin } from "@/lib/appearance";
import { buyShopSkin, recordReward, rewardEvent, shopSkins, type SheepSkin } from "@/lib/sheep-rewards";
import { SheepSprite } from "./SheepSprite";

const number = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0, notation: n >= 100000 ? "compact" : "standard" }).format(n);
const read = (key: string) => { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; } };
const save = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };

export default function MiniGames() {
  const [tab, setTab] = useState<"runner" | "farm" | "surprise" | "shop">("runner");
  useEffect(() => {
    const openHash = () => { if (window.location.hash === "#boutique") setTab("shop"); };
    openHash(); window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, []);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rosterStatus, setRosterStatus] = useState("Chargement des joueurs classés…");
  useEffect(() => {
    let active = true;
    const client = getSiteClient();
    Promise.all([client.from("players").select("*"), client.from("rankings").select("*")]).then(([p, r]) => {
      if (!active) return;
      if (p.error || r.error) { setRosterStatus("Classement indisponible : parcours avec des bottes de foin."); return; }
      const ranked = new Set((r.data as Ranking[]).filter(row => row.tier_id).map(row => row.player_id));
      const roster = (p.data as Player[]).filter(player => ranked.has(player.id));
      setPlayers(roster);
      setRosterStatus(roster.length ? `${roster.length} joueurs classés sur le parcours` : "Pas encore de joueur classé : saute par-dessus les bottes de foin !");
    }).catch(() => { if (active) setRosterStatus("Classement indisponible : parcours avec des bottes de foin."); });
    return () => { active = false; };
  }, []);
  return <main className="arcadePage container">
    <header className="arcadeHeader"><a href="/" className="brandLink"><BrandMark /></a><NoteBlock /><a href="/" className="secondaryButton"><ArrowLeft size={15} />Le classement</a></header><CommunityNav/>
    <div className="arcadeTitle"><span className="sectionKicker">Une pause entre deux combats</span><h1>La prairie arcade.</h1><p>Trois petits jeux. Des moutons partout. Juste pour le plaisir.</p></div>
    <a href="/plateforme" className="platformAdventureLink"><span aria-hidden="true">🐑 ⚑</span><span><strong>Bêê Adventure</strong><small>3 niveaux de plateforme · Crée et publie tes propres aventures</small></span><b>Jouer & créer →</b></a>
    <div className="arcadeTabs" role="tablist" aria-label="Mini-jeux">{[
      { id: "runner", title: "Sheep Run", subtitle: "Saute au-dessus des skins", icon: <Play size={20} /> },
      { id: "farm", title: "Blé Clicker", subtitle: "Fais grandir ton troupeau", icon: <Wheat size={20} /> },
      { id: "surprise", title: "La surprise", subtitle: "Un cadeau de la prairie", icon: <Gift size={20} /> },
      { id: "shop", title: "Boutique", subtitle: `${shopSkins.length} costumes à collectionner`, icon: <ShoppingBag size={20} /> }
    ].map(game => <button role="tab" id={`tab-${game.id}`} aria-controls={`panel-${game.id}`} aria-selected={tab === game.id} key={game.id} onClick={() => setTab(game.id as typeof tab)}>{game.icon}<span><strong>{game.title}</strong><small>{game.subtitle}</small></span></button>)}</div>
    <section role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="arcadePanel">
      {tab === "runner" ? <SheepRunner players={players} status={rosterStatus} /> : tab === "farm" || tab === "shop" ? <WheatClicker shop={tab === "shop"} onFarm={() => setTab("farm")} onShop={() => setTab("shop")} /> : <SheepMemory />}
    </section>
    <div className="arcadeSkinRewards"><Gift size={20} /><span><strong>6 skins à gagner pour les moutons du décor</strong><small>Sheep Run : 100 / 300 points · Blé Clicker : 100 / 10 000 blés récoltés · Jumeaux : une victoire / une victoire en 12 essais maximum.</small></span><button className="secondaryButton" onClick={() => window.dispatchEvent(new Event("sheeptier-open-skins"))}>Voir les skins</button></div>
    <p className="arcadePrivacy">Connecté : tes records, ta ferme et tes skins sont synchronisés avec ton compte. En invité, ils restent sur cet appareil. Les mini-jeux ne modifient pas la tierlist.</p>
  </main>;
}

function SheepRunner({ players, status }: { players: Player[]; status: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef(newRunner());
  const skins = useRef<Map<string, HTMLImageElement>>(new Map());
  const [phase, setPhase] = useState<"idle" | "running" | "paused" | "over">("idle");
  const [best, setBest] = useState(0);
  const [score, setScore] = useState(0);
  useEffect(() => { const stored = read("sheeptier-run-best"); if (Number.isFinite(stored) && stored >= 0) setBest(Math.floor(stored)); }, []);
  useEffect(() => {
    for (const player of players) {
      if (skins.current.has(player.minecraft_uuid)) continue;
      const image = new Image(); image.src = `https://mc-heads.net/body/${player.minecraft_uuid}/right/100`;
      skins.current.set(player.minecraft_uuid, image);
    }
  }, [players]);
  function draw() {
    const ctx = canvas.current?.getContext("2d"); if (!ctx) return;
    const state = engine.current;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#cde9ef"; ctx.fillRect(0, 0, 900, 300);
    ctx.fillStyle = "#fff7cc"; ctx.fillRect(765, 28, 39, 39);
    ctx.fillStyle = "#eef8f7";
    for (let i = 0; i < 4; i++) { const x = ((i * 280 - state.time * 14) % 1120 + 1120) % 1120 - 110; ctx.fillRect(x, 45 + i % 2 * 30, 85, 16); ctx.fillRect(x + 15, 35 + i % 2 * 30, 40, 14); }
    ctx.fillStyle = "#aacb90"; ctx.fillRect(0, 219, 900, 21);
    ctx.fillStyle = "#6e9744"; ctx.fillRect(0, 240, 900, 10);
    ctx.fillStyle = "#ac8b5e"; ctx.fillRect(0, 250, 900, 50);
    ctx.fillStyle = "#8d704b"; for (let i = 0; i < 28; i++) ctx.fillRect((i * 40 - state.time * 285) % 950, 266 + i % 2 * 18, 13, 7);
    const y = 192 + state.y;
    const wool = getComputedStyle(document.documentElement).getPropertyValue("--sheep-wool").trim() || "#fffdf0";
    ctx.fillStyle = "#736348"; ctx.fillRect(94, y + 35, 7, 13); ctx.fillRect(122, y + 35, 7, 13);
    ctx.fillStyle = wool; ctx.fillRect(85, y + 8, 42, 28); ctx.fillRect(93, y, 28, 12);
    ctx.fillStyle = "#807565"; ctx.fillRect(121, y + 13, 17, 21);
    ctx.fillStyle = "#fff"; ctx.fillRect(126, y + 18, 4, 4); ctx.fillStyle = "#262b23"; ctx.fillRect(129, y + 19, 2, 3);
    for (const obstacle of state.obstacles) {
      const player = players[obstacle.skin % Math.max(1, players.length)];
      const image = player ? skins.current.get(player.minecraft_uuid) : null;
      if (image?.complete && image.naturalWidth) ctx.drawImage(image, obstacle.x, 171, 42, 69);
      else { ctx.fillStyle = player ? "#7c9db6" : "#dfbd58"; ctx.fillRect(obstacle.x + 4, 180, 34, 60); ctx.fillStyle = player ? "#b7d4e0" : "#ab8538"; ctx.fillRect(obstacle.x + 6, 197, 30, 5); ctx.fillRect(obstacle.x + 6, 220, 30, 5); }
      if (player) { ctx.fillStyle = "#4f6145"; ctx.font = "11px monospace"; ctx.textAlign = "center"; ctx.fillText(player.username, obstacle.x + 21, 162); }
    }
    ctx.textAlign = "left"; ctx.fillStyle = "#405a36"; ctx.font = "bold 18px monospace"; ctx.fillText(`SCORE ${Math.floor(state.time * 10)}`, 20, 30);
  }
  useEffect(() => {
    draw();
    if (phase !== "running") return;
    let frame = 0; let last = 0;
    function tick(now: number) {
      const dt = last ? (now - last) / 1000 : 0; last = now;
      const previousScore = Math.floor(engine.current.time * 10);
      stepRunner(engine.current, dt, players.length); draw();
      const currentScore = Math.floor(engine.current.time * 10);
      if ([100, 300].some(goal => previousScore < goal && currentScore >= goal)) recordReward("runner", currentScore);
      if (engine.current.over) {
        const result = Math.floor(engine.current.time * 10); setScore(result);
        recordReward("runner", result);
        setBest(old => { const record = Math.max(old, result); save("sheeptier-run-best", record); return record; });
        setPhase("over"); return;
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    const hidden = () => { if (document.hidden) setPhase("paused"); };
    document.addEventListener("visibilitychange", hidden);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", hidden); };
  }, [phase, players]);
  function start() { engine.current = newRunner(); setScore(0); setPhase("running"); canvas.current?.focus(); }
  function jump() { if (phase === "running") jumpRunner(engine.current); }
  return <>
    <div className="gameHeading"><div><h2>Sheep Run</h2><p>Un mouton, les skins de la tierlist… et un bon timing.</p></div><span className="gameRecord"><Trophy size={16} />Record : {best}</span></div>
    <div className="runnerStage"><canvas ref={canvas} width={900} height={300} tabIndex={0} aria-label="Parcours de saut. Espace ou flèche haut pour sauter ; P pour mettre en pause." onPointerDown={event => { event.preventDefault(); canvas.current?.focus(); jump(); }} onKeyDown={event => {
      if ([" ", "ArrowUp", "w"].includes(event.key)) { event.preventDefault(); if (event.repeat) return; if (phase === "idle" || phase === "over") start(); else jump(); }
      if (event.key.toLowerCase() === "p") setPhase(current => current === "running" ? "paused" : current === "paused" ? "running" : current);
    }} />
    {phase !== "running" && <div className="runnerOverlay"><BrandMark compact /><h3>{phase === "idle" ? "Prêt à bondir ?" : phase === "paused" ? "Petite pause dans la prairie" : "Oups, un skin sur la route !"}</h3>{phase === "over" && <p>Score : {score} · Record : {best}</p>}<button className="primaryButton" onClick={() => phase === "paused" ? setPhase("running") : start()}><Play size={15} />{phase === "paused" ? "Reprendre" : phase === "over" ? "Rejouer" : "Commencer"}</button></div>}</div>
    <div className="gameControls"><button className="primaryButton" disabled={phase !== "running"} onClick={jump}>Sauter ↑</button><button className="secondaryButton" disabled={phase === "idle" || phase === "over"} onClick={() => setPhase(current => current === "running" ? "paused" : "running")}><Pause size={14} />{phase === "paused" ? "Reprendre" : "Pause"}</button><span>Espace / ↑ · clic sur le parcours · touche P pour pause</span></div>
    <p className="rosterNote">{status}</p>
  </>;
}

function WheatClicker({ shop, onFarm, onShop }: { shop: boolean; onFarm: () => void; onShop: () => void }) {
  const [farm, setFarm] = useState<FarmState>(newFarm);
  const [loaded, setLoaded] = useState(false);
  const [offline, setOffline] = useState(0);
  const [burst, setBurst] = useState(0);
  const clock = useRef(Date.now());
  const previousOwned = useRef<SheepSkin[]>([]);
  const [storageError, setStorageError] = useState(false);
  const [filter, setFilter] = useState<"all" | "available" | "owned">("all");
  const [themeNotice, setThemeNotice] = useState("");
  useEffect(() => {
    const stored = read("sheeptier-wheat-farm");
    const old = parseFarm(stored?.farm); const elapsed = Number.isFinite(stored?.savedAt) ? Math.max(0, (Date.now() - stored.savedAt) / 1000) : 0;
    const next = advanceFarm(old, elapsed); previousOwned.current = next.ownedSkins; setOffline(next.wheat - old.wheat); setFarm(next); setLoaded(true); clock.current = Date.now();
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const timer = setInterval(() => { const now = Date.now(); const seconds = (now - clock.current) / 1000; clock.current = now; setFarm(current => advanceFarm(current, seconds)); }, 1000);
    return () => clearInterval(timer);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem("sheeptier-wheat-farm", JSON.stringify({ farm, savedAt: Date.now() })); setStorageError(false); } catch { setStorageError(true); }
    recordReward("wheat", farm.total);
    const newlyUnlocked = farm.ownedSkins.filter(id => !previousOwned.current.includes(id));
    previousOwned.current = farm.ownedSkins;
    if (newlyUnlocked.length) window.dispatchEvent(new CustomEvent(rewardEvent, { detail: { newlyUnlocked } }));
  }, [farm, loaded]);
  const milestones = [100, 1000, 10000, 100000, 1000000];
  if (shop) return <>
    <div className="gameHeading"><div><span className="sectionKicker">Le comptoir de la prairie</span><h2>La boutique des moutons</h2><p>{shopSkins.length} costumes pixelisés et des clins d’œil à tes univers préférés.</p></div><span className="gameRecord"><ShoppingBag size={16} />{farm.ownedSkins.length} / {shopSkins.length} collectionnés</span></div>
    <div className="shopWallet"><div><Wheat size={26} /><span><strong>{number(farm.wheat)} blés</strong><small>Ta réserve du Clicker · +{number(farmRate(farm))} / seconde</small></span></div><button className="primaryButton" onClick={onFarm}>Récolter du blé →</button></div>
    <p className="shopIntro">Les prix sont payés avec ta réserve, pas avec ton total récolté. Un seul achat par skin, puis tu peux l’équiper autant que tu veux. Aucun paiement réel.</p>
    {storageError && <p className="shopStorageWarning" role="alert">La sauvegarde est bloquée dans ce navigateur. Active le stockage pour conserver ta ferme et tes achats après fermeture.</p>}
    <div className="shopFilters" aria-label="Filtrer les skins">{[{id:"all",name:"Tous les skins"},{id:"available",name:"À ma portée"},{id:"owned",name:"Ma collection"}].map(f => <button key={f.id} aria-pressed={filter===f.id} onClick={() => setFilter(f.id as typeof filter)}>{f.name}</button>)}</div>
    {themeNotice && <p className="shopThemeNotice" role="status">Fond appliqué : {themeNotice}. Tu peux le changer dans « Décor & moutons ».</p>}
    <div className="sheepShopGrid">{shopSkins.filter(s => filter === "all" || (filter === "owned" ? farm.ownedSkins.includes(s.id) : !farm.ownedSkins.includes(s.id) && farm.wheat >= s.price)).map(skin => {
      const owned = farm.ownedSkins.includes(skin.id);
      const matchingTheme = themeForSkin(skin.id);
      return <article className={`sheepShopCard ${owned ? "owned" : ""}`} key={skin.id}>
        <div className="shopSkinPreview"><SheepSprite skin={skin.id} /><span>{owned ? "✓ Collectionné" : skin.price >= 28000 ? "Prestige" : skin.price >= 4000 ? "Rare" : "Découverte"}</span></div>
        <h3>{skin.name}</h3><p>{skin.reference}</p><div className="shopPrice"><Wheat size={14} />{number(skin.price)} blés</div>
        {owned ? <button className="secondaryButton" onClick={() => window.dispatchEvent(new CustomEvent("sheeptier-open-skins", { detail: { skin: skin.id } }))}>Équiper</button> : <button className="primaryButton" disabled={!loaded || farm.wheat < skin.price || storageError} onClick={() => setFarm(current => buyShopSkin(current, skin.id))}>{farm.wheat < skin.price ? `Il manque ${number(skin.price - farm.wheat)} blés` : "Acheter le skin"}</button>}
        {matchingTheme && <button className="shopThemeButton" onClick={() => { window.dispatchEvent(new CustomEvent("sheeptier-set-theme", { detail: { theme: matchingTheme.id } })); setThemeNotice(matchingTheme.name); }}>Fond assorti · gratuit</button>}
      </article>;
    })}</div>
    {filter === "owned" && !farm.ownedSkins.length && <p className="shopEmpty">Ta collection t’attend ! Récolte 150 blés pour ton premier costume.</p>}
    {filter === "available" && !shopSkins.some(s => !farm.ownedSkins.includes(s.id) && farm.wheat >= s.price) && <p className="shopEmpty">Aucun nouveau costume à ce budget. Ton troupeau continue de produire ; tu peux aussi récolter dans le Clicker.</p>}
    <p className="shopIntro">Ta collection et le skin équipé suivent ton compte lorsque tu es connecté. En invité, ils restent dans ce navigateur. Recommencer la ferme conserve les costumes achetés.</p>
  </>;
  return <>
    <div className="gameHeading"><div><h2>Blé Clicker</h2><p>Récolte, recrute des moutons et construis ta ferme.</p></div><span className="gameRecord">{number(farm.total)} blés récoltés</span></div>
    <div className="farmBoutique"><span>Transforme tes blés en costumes pour les moutons du décor.</span><button className="secondaryButton" onClick={onShop}><ShoppingBag size={15} />Boutique · {shopSkins.length} skins</button></div>
    {storageError && <p className="shopStorageWarning" role="alert">La sauvegarde est bloquée dans ce navigateur. Active le stockage pour conserver ta progression.</p>}
    {offline >= 1 && <div className="farmOffline">Ton troupeau a récolté {number(offline)} blés pendant ton absence (jusqu’à 8 heures).<button aria-label="Fermer le message" onClick={() => setOffline(0)}>×</button></div>}
    <div className="farmLayout"><div className="farmField"><span className="sectionKicker">Ta réserve</span><strong className="wheatTotal">{number(farm.wheat)}<small>blés</small></strong><div className="farmRates"><span>+{number(farmClick(farm))} / clic</span><span>+{number(farmRate(farm))} / seconde</span></div>
      <button className="wheatButton" disabled={!loaded} aria-label={`Récolter ${farmClick(farm)} blés`} onClick={() => { setFarm(current => addWheat(current, farmClick(current))); setBurst(current => current + 1); }}><Wheat size={108} strokeWidth={1.7} />{burst > 0 && <span key={burst} className="wheatBurst" aria-hidden="true">+{number(farmClick(farm))}</span>}</button>
      <p>Clique sur le blé !</p><div className="farmHerd" aria-label={`${farm.levels[1]} moutons récolteurs`}>{Array.from({ length: Math.min(12, farm.levels[1]) }, (_, i) => <BrandMark compact key={i} />)}</div>
      <div className="farmMilestones">{milestones.map(goal => <span key={goal} className={farm.total >= goal ? "unlocked" : ""} title={`Récolter ${number(goal)} blés`}>{farm.total >= goal ? "★" : "☆"} {number(goal)}</span>)}</div>
    </div><div className="farmShop"><h3>Les améliorations</h3>{farmUpgrades.map((upgrade, i) => <button key={upgrade.name} className="farmUpgrade" disabled={!loaded || farm.wheat < upgradeCost(farm, i) || farm.levels[i] >= 1000} onClick={() => setFarm(current => buyUpgrade(current, i))}><span className="upgradeIcon" aria-hidden="true">{upgrade.icon}</span><span><strong>{upgrade.name} <b>×{farm.levels[i]}</b></strong><small>{upgrade.description}</small></span><span className="upgradePrice">{number(upgradeCost(farm, i))}<small>blés</small></span></button>)}<p>Chaque achat augmente le prix du suivant. La ferme continue de produire quand tu reviens.</p></div></div>
    <button className="farmReset" onClick={() => { if (window.confirm("Recommencer la ferme ? Tes skins achetés et gagnés seront conservés.")) { setFarm(current => ({ ...newFarm(), ownedSkins: current.ownedSkins })); setOffline(0); setBurst(0); clock.current = Date.now(); } }}><RotateCcw size={12} />Recommencer la ferme</button>
  </>;
}

function SheepMemory() {
  const [deck, setDeck] = useState<number[]>([]);
  const [game, setGame] = useState({ flipped: [] as number[], matched: [] as number[], turns: 0 });
  const [best, setBest] = useState(0);
  const colors = [0, 2, 4, 6, 9, 10, 13, 14].map(i => woolColors[i]);
  const won = game.matched.length === 16;
  useEffect(() => { setDeck(makeMemoryDeck()); const stored = read("sheeptier-memory-best"); if (Number.isFinite(stored) && stored > 0) setBest(Math.floor(stored)); }, []);
  useEffect(() => {
    if (game.flipped.length !== 2) return;
    const [a, b] = game.flipped; const match = deck[a] === deck[b];
    const timer = setTimeout(() => setGame(current => current.flipped[0] !== a || current.flipped[1] !== b ? current : { ...current, flipped: [], matched: match ? [...new Set([...current.matched, a, b])] : current.matched }), match ? 400 : 900);
    return () => clearTimeout(timer);
  }, [game.flipped, deck]);
  useEffect(() => {
    if (!won) return;
    recordReward("memory", game.turns);
    setBest(old => { const record = old ? Math.min(old, game.turns) : game.turns; save("sheeptier-memory-best", record); return record; });
  }, [won, game.turns]);
  return <>
    <div className="gameHeading"><div><span className="sectionKicker">Surprise !</span><h2>Les moutons jumeaux</h2><p>Retrouve les huit paires de laine avec le moins d’essais possible.</p></div><span className="gameRecord"><Trophy size={16} />{best ? `${best} essais` : "Record à établir"}</span></div>
    <div className="memoryStats"><span>{game.matched.length / 2} / 8 paires</span><span>{game.turns} essais</span></div>
    <div className="memoryGrid">{deck.map((value, i) => {
      const revealed = game.flipped.includes(i) || game.matched.includes(i); const color = colors[value];
      return <button key={i} className={`memoryCard ${revealed ? "revealed" : ""} ${game.matched.includes(i) ? "matched" : ""}`} style={{ "--sheep-wool": color.color } as React.CSSProperties} disabled={won || game.matched.includes(i) || game.flipped.length === 2 || game.flipped.includes(i)} aria-label={revealed ? `Mouton ${color.name.toLowerCase()}${game.matched.includes(i) ? ", paire trouvée" : ""}` : `Retourner le mouton caché ${i + 1}`} onClick={() => setGame(current => {
        if (current.flipped.length >= 2 || current.flipped.includes(i) || current.matched.includes(i)) return current;
        return { ...current, flipped: [...current.flipped, i], turns: current.turns + (current.flipped.length === 1 ? 1 : 0) };
      })}>{revealed ? <><BrandMark compact /><span>{color.name}</span></> : <><span className="memoryQuestion">?</span><small>SheepTier</small></>}</button>;
    })}</div>
    <div className="memoryFinish" role="status">{won ? <><strong>Tout le troupeau est réuni !</strong><span>{game.turns === 8 ? "Un sans-faute. La prairie te respecte." : `Les 8 paires retrouvées en ${game.turns} essais.`}</span></> : <span>Retourne deux cartes pour retrouver leurs couleurs.</span>}</div>
    <button className="primaryButton" onClick={() => { setGame({ flipped: [], matched: [], turns: 0 }); setDeck(makeMemoryDeck()); }}><RotateCcw size={15} />{won ? "Rejouer" : "Nouvelle partie"}</button>
  </>;
}
