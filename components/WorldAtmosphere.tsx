"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { defaultAppearance, parseAppearance, rankingFrames, woolColors, worldThemes, seasonalThemes, universeThemes, type Appearance, type WorldTheme } from "@/lib/appearance";
import { availableSkins, importGameRewards, rewardEvent, allSheepSkins, shopSkins, type SheepSkin } from "@/lib/sheep-rewards";
import { SheepSprite } from "./SheepSprite";
import { UniverseScene } from "./UniverseScene";


export default function WorldAtmosphere() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [unlocked, setUnlocked] = useState<SheepSkin[]>(["classic"]);
  const [rewardNotice, setRewardNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const enabled = useRef(true);
  useEffect(() => {
    importGameRewards();
    const available = availableSkins();
    setUnlocked(available);
    try {
      const saved = parseAppearance(JSON.parse(localStorage.getItem("sheeptier-appearance") || "null"));
      setAppearance({ ...saved, skin: available.includes(saved.skin) ? saved.skin : "classic" });
    } catch {}
    setPreferencesLoaded(true);
    const refresh = (event: Event) => {
      setUnlocked(availableSkins());
      const ids = (event as CustomEvent<{ newlyUnlocked?: SheepSkin[] }>).detail?.newlyUnlocked;
      if (ids?.length) setRewardNotice(ids.map(id => allSheepSkins.find(s => s.id === id)?.name).join(" · "));
    };
    const open = (event: Event) => {
      const skin = (event as CustomEvent<{ skin?: SheepSkin }>).detail?.skin;
      if (skin && availableSkins().includes(skin)) setAppearance(current => ({ ...current, skin }));
      setCustomizing(true);
    };
    const chooseTheme = (event: Event) => {
      const theme = (event as CustomEvent<{ theme?: WorldTheme }>).detail?.theme;
      if (worldThemes.some(t => t.id === theme)) setAppearance(current => ({ ...current, theme: theme! }));
    };
    const dressRanking = () => { setCustomizing(true); setTimeout(()=>document.getElementById("ranking-frame-options")?.scrollIntoView({block:"start",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"}),80); };
    window.addEventListener("sheeptier-open-ranking-frame", dressRanking);
    window.addEventListener(rewardEvent, refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("sheeptier-open-skins", open);
    window.addEventListener("sheeptier-set-theme", chooseTheme);
    return () => { window.removeEventListener("sheeptier-open-ranking-frame", dressRanking); window.removeEventListener(rewardEvent, refresh); window.removeEventListener("storage", refresh); window.removeEventListener("sheeptier-open-skins", open); window.removeEventListener("sheeptier-set-theme", chooseTheme); };
  }, []);
  useEffect(() => {
    if (!rewardNotice) return;
    const timer = setTimeout(() => setRewardNotice(""), 8000);
    return () => clearTimeout(timer);
  }, [rewardNotice]);
  useEffect(() => {
    if (!preferencesLoaded) return;
    document.documentElement.dataset.rankingFrame = appearance.frame;
    document.documentElement.dataset.worldTheme = appearance.theme;
    document.documentElement.dataset.worldMotion = appearance.animated ? "on" : "off";
    document.documentElement.style.setProperty("--sheep-wool", appearance.wool);
    const universe = universeThemes.find(t => t.id === appearance.theme);
    for (const part of ["sky", "middle", "ground", "foliage"] as const) {
      if (universe) document.documentElement.style.setProperty(`--scene-${part}`, part === "foliage" ? universe.accent : universe[part]);
      else document.documentElement.style.removeProperty(`--scene-${part}`);
    }
    try { localStorage.setItem("sheeptier-appearance", JSON.stringify(appearance)); } catch {}
  }, [appearance, preferencesLoaded]);
  useEffect(() => {
    if (customizing && !dialog.current?.open) dialog.current?.showModal();
    else if (!customizing && dialog.current?.open) dialog.current.close();
  }, [customizing]);
  useEffect(() => {
    try { enabled.current = localStorage.getItem("sheeptier-button-sounds") !== "off"; } catch {}
    setSoundEnabled(enabled.current);
    const pool = Array.from({ length: 4 }, () => {
      const player = new Audio("/audio/button-click.wav");
      player.preload = "auto"; player.volume = .4;
      return player;
    });
    let next = 0;
    function click(event: MouseEvent) {
      if (!event.isTrusted || !enabled.current || !(event.target instanceof Element)) return;
      const button = event.target.closest("button, a[href], input[type=submit], input[type=button], [role=button]");
      if (!button || button.matches(":disabled, [aria-disabled=true], [data-silent]")) return;
      const player = pool[next++ % pool.length];
      player.currentTime = 0;
      void player.play().catch(() => {});
    }
    document.addEventListener("click", click, true);
    return () => {
      document.removeEventListener("click", click, true);
      for (const player of pool) { player.pause(); player.removeAttribute("src"); player.load(); }
    };
  }, []);
  const selectedUniverse = universeThemes.find(theme => theme.id === appearance.theme);
  return <>
    <div className="overworldBackdrop" aria-hidden="true">
      {selectedUniverse && <UniverseScene theme={selectedUniverse.id} />}
      <div className="overworldCloud ambientCloudOne" /><div className="overworldCloud ambientCloudTwo" />
      <div className="seasonSun" />
      <div className="seasonGarden"><i className="seasonTree treeLeft" /><i className="seasonTree treeRight" />{Array.from({ length: 9 }, (_, i) => <i className="seasonFlower" key={i} style={{ "--flower-x": `${5 + i * 11}%` } as React.CSSProperties} />)}</div>
      <div className="seasonWeather">{Array.from({ length: 20 }, (_, i) => <i key={i} style={{ "--particle-x": `${i * 5 + 1}%`, "--particle-time": `${10 + i % 6}s`, "--particle-delay": `${-i * 2.7}s` } as React.CSSProperties} />)}</div>
      <div className="seasonPumpkins"><i /><i /><i /></div>
      <div className="christmasLights">{Array.from({ length: 16 }, (_, i) => <i key={i} />)}</div>
      {Array.from({ length: 10 }, (_, i) => <div key={i} className={`pastureTraveler ${i % 2 ? "travelerReverse" : ""}`} style={{ "--lane": `${8 + i * 9}%`, "--duration": `${42 + i * 4}s`, "--offset": `${-i * 9 - 6}s`, "--sheep-scale": .7 + (i % 3) * .25 } as React.CSSProperties}><SheepSprite skin={appearance.skin} /></div>)}
    </div>
    <button className="appearanceToggle" onClick={() => setCustomizing(true)} aria-haspopup="dialog"><Palette size={17} /><span>Décor & moutons</span></button>
    <dialog ref={dialog} className="appearanceDialog" aria-labelledby="appearance-title" onCancel={() => setCustomizing(false)} onClose={() => setCustomizing(false)} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setCustomizing(false);
    }}>
      <div className="appearanceHeading"><div><span className="sectionKicker">Ton petit monde</span><h2 id="appearance-title">Décor & moutons</h2></div><button autoFocus className="appearanceClose" aria-label="Fermer la personnalisation" onClick={() => setCustomizing(false)}><X size={20} /></button></div>
      <p className="appearanceIntro">Choisis ton ambiance. Tes préférences restent sur cet appareil.</p>
      <section id="ranking-frame-options" className="rankingFrameOptions"><h3>Les bordures du classement <span>8 cosmétiques gratuits</span></h3><p className="skinExplanation">Habille ton classement sans changer les joueurs ni leurs points. Ton choix est sauvegardé avec tes préférences.</p><div className="rankingFrameChoices">{rankingFrames.map(frame=><button key={frame.id} className={`rankingFrameChoice framePreview-${frame.id} ${appearance.frame===frame.id?"selected":""}`} aria-pressed={appearance.frame===frame.id} onClick={()=>setAppearance(current=>({...current,frame:frame.id}))}><span className="frameMiniature" aria-hidden="true"><span>{frame.icon}</span><SheepSprite skin="classic"/><i/><i/></span><strong>{frame.name}</strong><small>{appearance.frame===frame.id?"✓ Équipée":frame.detail}</small></button>)}</div></section><h3>Le paysage</h3>
      <div className="themeChoices">{seasonalThemes.map(theme => <button key={theme.id} className={`themeChoice ${appearance.theme === theme.id ? "selected" : ""}`} aria-pressed={appearance.theme === theme.id} onClick={() => setAppearance(current => ({ ...current, theme: theme.id }))}>
        <span className={`themePreview preview-${theme.id}`} aria-hidden="true"><i /><b /></span><strong>{theme.name}</strong><small>{theme.detail}</small>
      </button>)}</div>
      <h3>Les univers de la boutique <span>{universeThemes.length} décors</span></h3>
      <p className="skinExplanation">Choisis un fond assorti à ton costume ou mélange les univers. Tous ces décors sont disponibles gratuitement. Le choix du fond ne change pas ton skin.</p>
      <div className="themeChoices universeChoices">{universeThemes.map(theme => <button key={theme.id} className={`themeChoice ${appearance.theme === theme.id ? "selected" : ""}`} aria-pressed={appearance.theme === theme.id} onClick={() => setAppearance(current => ({ ...current, theme: theme.id }))}>
        <span className="themePreview universeThemePreview"><UniverseScene theme={theme.id} preview /></span><strong>{theme.name}</strong><small>{theme.detail}</small>
      </button>)}</div>
      <h3>La laine des moutons <span>{woolColors.find(color => color.color === appearance.wool)?.name || "Personnalisée"}</span></h3>
      <div className="woolChoices">{woolColors.map(color => <button key={color.name} className={appearance.wool === color.color ? "selected" : ""} style={{ "--swatch": color.color } as React.CSSProperties} aria-label={`Laine ${color.name.toLowerCase()}`} title={color.name} aria-pressed={appearance.wool === color.color} onClick={() => setAppearance(current => ({ ...current, wool: color.color }))} />)}</div>
      <div className="appearanceOptions"><label className="customWool">Couleur personnalisée<input type="color" value={appearance.wool} onChange={event => setAppearance(current => ({ ...current, wool: event.target.value }))} /></label><label className="motionChoice"><input type="checkbox" checked={appearance.animated} onChange={event => setAppearance(current => ({ ...current, animated: event.target.checked }))} />Animer le décor</label></div>
      <h3>Les skins du troupeau <span>{unlocked.length - 1} / {allSheepSkins.length - 1} débloqués</span></h3>
      <p className="skinExplanation">6 skins à gagner dans les jeux et {shopSkins.length} à acheter avec tes blés dans la boutique. Tous restent acquis si tu recommences la ferme. Les costumes de la boutique ont leur palette ; la laine des autres skins reste personnalisable.</p>
      <div className="skinChoices">{allSheepSkins.map(skin => {
        const available = unlocked.includes(skin.id);
        return <button key={skin.id} className={`skinChoice ${appearance.skin === skin.id ? "selected" : ""} ${available ? "" : "locked"}`} disabled={!available} aria-pressed={appearance.skin === skin.id} onClick={() => setAppearance(current => ({ ...current, skin: skin.id }))}>
          <span className="skinPreview" style={{ "--sheep-wool": appearance.wool } as React.CSSProperties}><SheepSprite skin={skin.id} /></span><strong>{skin.name}</strong><small>{available ? appearance.skin === skin.id ? "✓ Équipé" : "Débloqué · équiper" : "🔒 " + skin.goal}</small>
        </button>;
      })}</div>
      <a className="skinArcadeLink" href="/jeux">Jouer pour débloquer les skins →</a>
      <a className="skinArcadeLink" href="/jeux#boutique">Ouvrir la boutique →</a>
      <div className="appearanceFooter"><button className="secondaryButton" onClick={() => setAppearance({ ...defaultAppearance })}><RotateCcw size={14} />Réinitialiser</button><button className="primaryButton" onClick={() => setCustomizing(false)}>C’est parfait !</button></div>
    </dialog>
    {rewardNotice && <div className="skinRewardToast" role="status"><span>★ Skin débloqué !<strong>{rewardNotice}</strong></span><button onClick={() => { setCustomizing(true); setRewardNotice(""); }}>Équiper</button><button aria-label="Fermer la récompense" onClick={() => setRewardNotice("")}><X size={16} /></button></div>}
    <button className="buttonSoundToggle" data-silent aria-label={soundEnabled ? "Couper les sons des boutons" : "Activer les sons des boutons"} aria-pressed={soundEnabled} title={soundEnabled ? "Couper les sons des boutons" : "Activer les sons des boutons"} onClick={() => {
      enabled.current = !enabled.current;
      setSoundEnabled(enabled.current);
      try { localStorage.setItem("sheeptier-button-sounds", enabled.current ? "on" : "off"); } catch {}
    }}>{soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}<span>Sons des boutons</span></button>
  </>;
}
