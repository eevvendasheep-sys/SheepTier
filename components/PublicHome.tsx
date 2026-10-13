"use client";
import CommunityNav from "./CommunityNav";

import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, Sparkles, Trophy, Users, LogIn, ExternalLink, ChevronRight } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { NoteBlock } from "./WorldExperience";
import { demoModes, demoPlayers, demoRankings, demoSettings, demoTiers } from "@/lib/demo";
import { getSiteClient, hasSiteConnection } from "@/lib/site-client";
import type { GameMode, Player, Ranking, SiteSettings, Tier } from "@/lib/types";

const avatar = (uuid: string) => `https://mc-heads.net/avatar/${uuid}/96`;
const bodyRender = (uuid: string) => `https://mc-heads.net/body/${uuid}/right/160`;

export default function PublicHome() {
  const [settings, setSettings] = useState<SiteSettings>(demoSettings);
  const [modes, setModes] = useState<GameMode[]>(demoModes);
  const [tiers, setTiers] = useState<Tier[]>(demoTiers);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<string>("all");
  const [selected, setSelected] = useState<Player | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const client = getSiteClient();
    if (!client) return;

    let stopped = false, loading = false;
    async function load() {
      if (stopped || loading || document.visibilityState === "hidden") return;
      loading = true;
      try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) throw new Error('Classement indisponible.');
      const data = await response.json();
      if (stopped) return;
      if (data.settings) setSettings(data.settings as SiteSettings);
      setModes(data.modes as GameMode[]);
      setTiers(data.tiers as Tier[]);
      setPlayers(data.players as Player[]);
      setRankings(data.rankings as Ranking[]);
      setIsDemo(false);
      setLoadError("");
      } finally { loading = false; }
    }
    const refresh = () => { load().catch(() => { if (!stopped) setLoadError("Le classement n’a pas pu être chargé. Actualise la page pour réessayer."); }); };
    refresh();
    const timer = window.setInterval(refresh, 15000);
    document.addEventListener("visibilitychange", refresh);
    return () => { stopped = true; window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, []);

  const tierMap = useMemo(() => Object.fromEntries(tiers.map(t => [t.id, t])), [tiers]);

  const rows = useMemo(() => {
    return players.map(player => {
      const rs = rankings.filter(r => r.player_id === player.id && (mode === "all" || r.gamemode_id === mode));
      const total = rs.reduce((sum, r) => sum + Number(r.points || 0), 0);
      return { player, rankings: rs, total };
    })
    .filter(x => x.player.username.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.total - a.total);
  }, [players, rankings, mode, query]);

  const totalRankings = rankings.filter(r => r.tier_id).length;
  const top = rows[0];

  return (
    <main style={{ "--accent": settings.accent_color } as React.CSSProperties}>
      <header className="topbar container">
        <div className="worldBrand"><NoteBlock /><a href="/" className="brandLink"><BrandMark name={settings.site_name} /></a></div>
        <CommunityNav/>
        <a href="/login" className="ghostButton"><LogIn size={17}/> Administration</a>
      </header>

      {settings.announcement && (
        <div className="announcement">
          <Sparkles size={15} />
          <span>{settings.announcement}</span>
        </div>
      )}

      <section id="classement" className="rankingSection container pastureRanking" aria-labelledby="world-arrival">
        <div className="rankingCrest" aria-hidden="true"><BrandMark compact/><span>LA PRAIRIE DES CHAMPIONS</span><BrandMark compact/></div>
        <div className="sectionHeading">
          <div>
            <span className="sectionKicker">Le troupeau entre en compétition</span>
            <h1 id="world-arrival" tabIndex={-1}>Le classement <em>{settings.site_name}</em></h1>
          </div>
          <div className="searchBox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher un joueur..."/></div>
        </div>

        <div className="rankingToolbar"><p><Users size={14}/><strong>{players.length}</strong> joueurs <span>·</span> <Trophy size={14}/><strong>{totalRankings}</strong> tiers attribués</p><button className="rankingDressButton" onClick={()=>window.dispatchEvent(new CustomEvent("sheeptier-open-ranking-frame"))}><Sparkles size={15}/> Habiller le classement</button></div>
        <div className="filterBar" aria-label="Filtrer le classement par gamemode">
          <button className={mode==="all" ? "active":""} onClick={()=>setMode("all")}>Général</button>
          {modes.map(g => <button key={g.id} className={mode===g.id?"active":""} onClick={()=>setMode(g.id)}>{g.logo_url && <img src={g.logo_url} alt=""/>}{g.name}</button>)}
        </div>

        <div className="leaderboard">
          <div className="tableHead">
            <span>#</span><span>Joueur</span><span>Région</span><span>Tiers</span><span>Points</span>
          </div>
          {rows.map((row, i) => (
            <button key={row.player.id} className="playerRow" onClick={()=>setSelected(row.player)}>
              <span className={`position p${i+1}`}>{i+1}</span>
              <span className="playerIdentity">
                <img src={avatar(row.player.minecraft_uuid)} alt=""/>
                <span><strong>{row.player.username}</strong><small>Voir le profil</small></span>
              </span>
              <span><span className="regionBadge">{row.player.region || "—"}</span></span>
              <span className="tierStack">
                {row.rankings.length ? row.rankings.slice(0, 5).map(r => {
                  const t = r.tier_id ? tierMap[r.tier_id] : null;
                  const gm = modes.find(g=>g.id===r.gamemode_id);
                  return t ? <span key={r.gamemode_id} className="tierChip" style={{"--tier":t.color} as React.CSSProperties} title={`${gm?.name || ""} — ${t.label}`}>{gm?.logo_url && <img src={gm.logo_url} alt=""/>}{t.code}</span> : null;
                }) : <span className="muted">Non classé</span>}
              </span>
              <span className="points">{row.total}<small>pts</small></span>
            </button>
          ))}
          {loadError && <div className="emptyState" role="alert">{loadError}</div>}
          {!loadError && !rows.length && <div className="emptyState">{players.length ? "Aucun joueur ne correspond à cette recherche." : "Le classement démarre bientôt. Ajoute tes premiers joueurs depuis l’administration."}</div>}
        </div>
      </section>


      <section className="hero container">
        <div className="heroCopy">
          <div className="eyebrow"><span className="dot"/> Ranking Minecraft • Communautaire</div>
          <span className="worldCaption">UN MONDE DE BLOCS. UNE COMMUNAUTÉ.</span>
          <h2 className="homePresentationTitle">{settings.hero_title || "Chaque combat"}<br/><em>{settings.hero_highlight || "laisse une trace."}</em></h2>
          <p>{settings.tagline}</p>
          <div className="heroActions">
            <a href="#classement" className="primaryButton">Voir le classement <ChevronRight size={18}/></a>
            <a href="/jeux" className="secondaryButton">La prairie arcade <ChevronRight size={18}/></a>
            {settings.discord_url && <a href={settings.discord_url} target="_blank" rel="noopener noreferrer" className="secondaryButton">Rejoindre Discord <ExternalLink size={16}/></a>}
          </div>
          <div className="miniStats">
            <span><strong>{players.length}</strong> joueurs</span>
            <span><strong>{modes.length}</strong> modes</span>
            <span><strong>{totalRankings}</strong> rankings</span>
          </div>
        </div>

        <div className="heroVisual">
          <div className="glow"/>
          <div className="podiumCard">
            <div className="podiumBadge"><Trophy size={16}/> #1 OVERALL</div>
            {top && <>
              <img className="heroSkin" src={bodyRender(top.player.minecraft_uuid)} alt={top.player.username}/>
              <div className="podiumName">{top.player.username}</div>
              <div className="podiumPoints">{top.total} pts</div>
            </>}
            {!top && <div className="emptyPodium"><BrandMark compact/><strong>La première place t’attend</strong><small>Le classement commence avec vos premiers joueurs.</small></div>}
            <div className="pixelGrid"/>
          </div>
          <div className="floatingTag tagA">HT1 <small>élite</small></div>
          <div className="floatingTag tagB"><ShieldCheck size={16}/> vérifié</div>
        </div>
      </section>

      <section id="modes" className="container modesStrip">
        <div className="sectionKicker">Gamemodes</div>
        <div className="modeGrid">
          {modes.map(g => (
            <button key={g.id} onClick={() => {setMode(g.id); document.getElementById("classement")?.scrollIntoView({behavior:"smooth"});}} className="modeCard">
              <div className="modeLogoWrap">{g.logo_url ? <img src={g.logo_url} alt=""/> : <span>{g.name.slice(0,2)}</span>}</div>
              <div><strong>{g.name}</strong><small>{g.description || "Classement compétitif"}</small></div>
              <ChevronRight size={18}/>
            </button>
          ))}
        </div>
      </section>

      <section id="apropos" className="container aboutGrid">
        <div className="aboutCard accentCard">
          <span className="sectionKicker">Notre identité</span>
          <h3>{settings.about_title || "Compétitif sans être générique."}</h3>
          <p>{settings.about_description || "Le classement Minecraft de notre communauté. Retrouve tes tiers et progresse dans chaque gamemode."}</p>
        </div>
        <div className="aboutCard">
          <Users size={24}/>
          <h3>Géré par ta communauté</h3>
          <p>Les rankings sont administrés depuis un espace privé. Les visiteurs ne peuvent que consulter.</p>
        </div>
        <div className="aboutCard">
          <ShieldCheck size={24}/>
          <h3>Données protégées</h3>
          <p>Chaque modification est vérifiée côté serveur selon les permissions de ton compte.</p>
        </div>
      </section>

      <footer className="container footer">
        <BrandMark name={settings.site_name} />
        <span>© {new Date().getFullYear()} {settings.site_name}. Projet communautaire non affilié à Mojang ou Microsoft.</span>
        {isDemo && <span className="demoPill">MODE DÉMO</span>}
      </footer>

      {selected && (
        <div className="modalBackdrop" onClick={()=>setSelected(null)}>
          <div className="playerModal" onClick={e=>e.stopPropagation()}>
            <button className="modalClose" onClick={()=>setSelected(null)}>×</button>
            <img className="modalSkin" src={bodyRender(selected.minecraft_uuid)} alt=""/>
            <div className="modalContent">
              <span className="sectionKicker">Profil joueur</span>
              <h2>{selected.username}</h2>
              <div className="profileMeta"><span>{selected.region || "Région inconnue"}</span><span>{rankings.filter(r=>r.player_id===selected.id).reduce((s,r)=>s+r.points,0)} points</span></div>
              <div className="profileRanks">
                {modes.map(g => {
                  const r = rankings.find(r=>r.player_id===selected.id && r.gamemode_id===g.id);
                  const t = r?.tier_id ? tierMap[r.tier_id] : null;
                  return <div key={g.id}><span>{g.logo_url && <img src={g.logo_url} alt=""/>}{g.name}</span>{t ? <strong style={{color:t.color}}>{t.code}</strong> : <strong className="muted">—</strong>}</div>
                })}
              </div>
              {selected.namemc_url && <a className="secondaryButton full" href={selected.namemc_url} target="_blank" rel="noopener noreferrer">Ouvrir sur NameMC <ExternalLink size={15}/></a>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

