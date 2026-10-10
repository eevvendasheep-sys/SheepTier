"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Music2, SkipForward, Volume2, VolumeX } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { minecraftDiscs, shuffledDiscIndices } from "@/lib/discs";

export function WorldEntrance({ name }: { name: string }) {
  const [phase, setPhase] = useState<"checking" | "welcome" | "sheep" | "done">("checking");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let entered = false;
    try { entered = sessionStorage.getItem("sheeptier-world-entered") === "yes"; } catch {}
    setPhase(entered ? "done" : "welcome");
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    if (phase === "welcome") enterButton.current?.focus();
    if (phase !== "welcome" && phase !== "sheep") return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [phase]);
  function enter() {
    try { sessionStorage.setItem("sheeptier-world-entered", "yes"); } catch {}
    setPhase("sheep");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => {
      setPhase("done");
      const target = document.getElementById("world-arrival");
      target?.focus({ preventScroll: true });
    }, reduced ? 150 : 2600);
  }
  if (phase === "done" || phase === "checking") return null;
  return <div className={`worldEntrance ${phase === "sheep" ? "departing" : ""}`} role="dialog" aria-modal="true" aria-label={`Bienvenue sur ${name}`} onKeyDown={e => {
    if (e.key === "Tab") { e.preventDefault(); enterButton.current?.focus(); }
  }}>
    <div className="pixelSun" aria-hidden="true" />
    <div className="pixelCloud cloudOne" aria-hidden="true" /><div className="pixelCloud cloudTwo" aria-hidden="true" />
    <div className="worldHills" aria-hidden="true"><i /><i /><i /></div>
    <div className="welcomeCard">
      <BrandMark name={name} />
      <span className="sectionKicker">Bienvenue dans ton monde</span>
      <h1>De la laine.<br />Des blocs.<br /><em>Du talent.</em></h1>
      <p>Le point de rencontre de ta communauté Minecraft.<br />Entre, découvre les tiers et vise le sommet.</p>
      <button ref={enterButton} className="primaryButton" onClick={enter} disabled={phase === "sheep"}>Entrer dans {name} <ArrowRight size={18} /></button>
      <small>Classements · Gamemodes · Communauté</small>
    </div>
    <div className="pastureSheep" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <div key={i} style={{ "--i": i } as React.CSSProperties}><BrandMark compact /></div>)}</div>
    {phase === "sheep" && <div className="sheepWave" aria-hidden="true">{Array.from({ length: 48 }, (_, i) => <div className="waveTile" key={i} style={{ "--delay": `${(i % 8) * 45 + Math.floor(i / 8) * 65}ms`, "--tilt": `${i % 2 ? -12 : 12}deg` } as React.CSSProperties}><BrandMark compact /></div>)}</div>}
    <span className="srOnly" role="status">{phase === "sheep" ? "Les moutons te conduisent au classement." : "Bienvenue."}</span>
  </div>;
}

export function NoteBlock() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(-1);
  const [message, setMessage] = useState("");
  const audio = useRef<HTMLAudioElement>(null);
  const bag = useRef<number[]>([]);
  const started = useRef(false);
  const playRequest = useRef(0);
  useEffect(() => {
    // Audio playback must begin inside a trusted user gesture, including Enter.
    function start(event: MouseEvent) {
      if (!event.isTrusted || started.current || (event.target instanceof Element && event.target.closest(".jukebox"))) return;
      try { if (sessionStorage.getItem("sheeptier-music-muted") === "yes") return; } catch {}
      started.current = true;
      choose();
    }
    document.addEventListener("click", start, true);
    return () => { document.removeEventListener("click", start, true); playRequest.current++; };
  }, []);
  function rememberMuted(muted: boolean) {
    try { sessionStorage.setItem("sheeptier-music-muted", muted ? "yes" : "no"); } catch {}
  }
  function play() {
    const request = ++playRequest.current;
    audio.current?.play().then(() => {
      if (request !== playRequest.current) return;
      setPlaying(true); setMessage(""); rememberMuted(false);
    }).catch(() => {
      if (request !== playRequest.current) return;
      setPlaying(false); setMessage("Clique sur le note block pour relancer la musique.");
    });
  }
  function choose(previous = -1) {
    if (!bag.current.length) bag.current = shuffledDiscIndices(minecraftDiscs.length, previous);
    const index = bag.current.shift()!;
    setCurrent(index);
    const player = audio.current;
    if (!player) return;
    player.src = minecraftDiscs[index].url;
    player.volume = .35;
    play();
  }
  function toggle() {
    started.current = true;
    if (audio.current && !audio.current.paused) {
      playRequest.current++; audio.current.pause(); setPlaying(false); rememberMuted(true);
    } else if (current >= 0) play();
    else choose();
  }
  return <div className="jukebox">
    <button className={`noteBlock ${playing ? "isPlaying" : ""}`} onClick={toggle} aria-label={playing ? "Couper la musique" : "Jouer les musiques Minecraft"} aria-pressed={playing} title={playing ? "Couper la musique" : "Jouer les musiques Minecraft"}>
      <span className="noteFace" aria-hidden="true" /><span className="blockStatus" aria-hidden="true">{playing ? <Volume2 size={12} /> : <VolumeX size={12} />}</span>
      {playing && <span className="flyingNote" aria-hidden="true">♪</span>}
    </button>
    <div className="jukeboxInfo" aria-live="polite"><strong><Music2 size={11} /> Note block</strong><small>{current >= 0 ? minecraftDiscs[current].name : "4 musiques · aléatoire"}</small></div>
    <button className="addDiscs" onClick={() => { started.current = true; choose(current); }} aria-label="Musique suivante" title="Musique suivante"><SkipForward size={14} /></button>
    <audio ref={audio} preload="none" onPause={() => setPlaying(false)} onEnded={() => choose(current)} onError={() => { playRequest.current++; setPlaying(false); setMessage("Le morceau n’a pas pu être chargé. Essaie le bouton suivant."); }} />
    {message && <span className="musicMessage" role="status">{message}</span>}
  </div>;
}
