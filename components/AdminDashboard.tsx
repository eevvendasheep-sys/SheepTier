"use client";
import DiscordRankSettings from "./DiscordRankSettings";
import VillageEditor from "./VillageEditor";
import OwnerAccountBinding from "./OwnerAccountBinding";
import CommunityVideos from "./CommunityVideos";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BadgePlus, Brush, Check, Gamepad2, LayoutDashboard, LogOut, Plus, Save, Search, Settings2, Shield, Trash2, Upload, UserCog, Users, X } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { demoModes, demoPlayers, demoRankings, demoSettings, demoTiers } from "@/lib/demo";
import { getSiteClient, hasSiteConnection } from "@/lib/site-client";
import type { GameMode, Player, Profile, Ranking, Role, SiteSettings, Tier } from "@/lib/types";

type Tab = "overview" | "players" | "modes" | "tiers" | "branding" | "access" | "videos" | "village" | "discord";

const head = (uuid: string) => `https://mc-heads.net/avatar/${uuid}/72`;

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [settings, setSettings] = useState<SiteSettings>(demoSettings);
  const [modes, setModes] = useState<GameMode[]>(demoModes);
  const [tiers, setTiers] = useState<Tier[]>(demoTiers);
  const [players, setPlayers] = useState<Player[]>(demoPlayers);
  const [rankings, setRankings] = useState<Ranking[]>(demoRankings);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [role, setRole] = useState<Role>("viewer");
  const [ready, setReady] = useState(false);
  const [demo, setDemo] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [playerInput, setPlayerInput] = useState("");
  const [regionInput, setRegionInput] = useState("EU");
  const [resolving, setResolving] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [playerSearch, setPlayerSearch] = useState("");
  const [editMode, setEditMode] = useState<GameMode | null>(null);
  const [editTier, setEditTier] = useState<Tier | null>(null);

  const canEdit = role === "admin" || role === "editor";
  const isAdmin = role === "admin";

  useEffect(() => {
    async function boot() {
      const client = getSiteClient();
      if (!client) {
        if (!localStorage.getItem("sheeptier-demo-admin")) {
          window.location.href = "/login";
          return;
        }
        setDemo(true);
        setReady(true);
        return;
      }

      const { data: auth } = await client.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }
      const { data: roleRow, error: roleError } = await client.from("user_roles").select("role").eq("user_id", auth.user.id).maybeSingle();
      if (roleError) throw new Error(roleError.message);
      const currentRole = (roleRow?.role || "viewer") as Role;
      setRole(currentRole);

      const [s, g, t, p, r] = await Promise.all([
        client.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        client.from("gamemodes").select("*").order("sort_order"),
        client.from("tiers").select("*").order("sort_order"),
        client.from("players").select("*").order("username"),
        client.from("rankings").select("*")
      ]);
      const firstError = [s, g, t, p, r].find(result => result.error)?.error;
      if (firstError) throw new Error(firstError.message);
      if (s.data) setSettings(s.data as SiteSettings);
      if (g.data) setModes(g.data as GameMode[]);
      if (t.data) setTiers(t.data as Tier[]);
      if (p.data) setPlayers(p.data as Player[]);
      if (r.data) setRankings(r.data as Ranking[]);

      if (currentRole === "admin") {
        const { data } = await client.from("admin_users_view").select("*").order("email");
        if (data) setProfiles(data as Profile[]);
      }
      setDemo(false);
      setReady(true);
    }
    boot().catch(() => { setLoadError("Impossible de charger l’administration. Actualise la page pour réessayer."); setReady(true); });
  }, []);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function logout() {
    await getSiteClient()?.auth.signOut();
  }

  async function resolvePlayer() {
    if (!playerInput.trim()) return;
    setResolving(true); setPreview(null);
    try {
      const res = await fetch(`/api/minecraft/resolve?input=${encodeURIComponent(playerInput)}`);
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setPreview(data);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Joueur introuvable");
    }
    setResolving(false);
  }

  async function addPlayer() {
    if (!preview || !canEdit) return;
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      minecraft_uuid: preview.uuid,
      username: preview.username,
      namemc_url: preview.namemcUrl,
      skin_url: preview.skinUrl,
      region: regionInput || null
    };
    const client = getSiteClient();
    if (client) {
      const { data, error } = await client.from("players").insert({
        minecraft_uuid: newPlayer.minecraft_uuid,
        username: newPlayer.username,
        namemc_url: newPlayer.namemc_url,
        skin_url: newPlayer.skin_url,
        region: newPlayer.region
      }).select().single();
      if (error) return notify(error.message);
      setPlayers(prev => [...prev, data as Player]);
    } else {
      setPlayers(prev => [...prev, newPlayer]);
    }
    setPreview(null); setPlayerInput("");
    notify(`${newPlayer.username} ajouté.`);
  }

  async function deletePlayer(id: string) {
    if (!canEdit || !confirm("Supprimer ce joueur et tous ses rankings ?")) return;
    const client = getSiteClient();
    if (client) {
      const { error } = await client.from("players").delete().eq("id", id);
      if (error) return notify(error.message);
    }
    setPlayers(p=>p.filter(x=>x.id!==id));
    setRankings(r=>r.filter(x=>x.player_id!==id));
    notify("Joueur supprimé.");
  }

  async function setPlayerTier(playerId: string, gamemodeId: string, tierId: string) {
    if (!canEdit) return;
    const tier = tiers.find(t=>t.id===tierId);
    const existing = rankings.find(r=>r.player_id===playerId && r.gamemode_id===gamemodeId);

    if (!tierId) {
      const client = getSiteClient();
      if (client) { const { error } = await client.from("rankings").delete().eq("player_id", playerId).eq("gamemode_id", gamemodeId); if (error) return notify(error.message); }
      setRankings(r=>r.filter(x=>!(x.player_id===playerId && x.gamemode_id===gamemodeId)));
      return;
    }

    const row: Ranking = { player_id: playerId, gamemode_id: gamemodeId, tier_id: tierId, points: tier?.points || 0 };
    const client = getSiteClient();
    if (client) {
      const { data, error } = await client.from("rankings").upsert(row, { onConflict: "player_id,gamemode_id" }).select().single();
      if (error) return notify(error.message);
      setRankings(prev => [...prev.filter(x=>!(x.player_id===playerId && x.gamemode_id===gamemodeId)), data as Ranking]);
    } else {
      setRankings(prev => [...prev.filter(x=>!(x.player_id===playerId && x.gamemode_id===gamemodeId)), {...row, id: existing?.id || crypto.randomUUID()}]);
    }
  }

  async function addMode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canEdit) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const slug = String(fd.get("slug") || name.toLowerCase().replace(/[^a-z0-9]+/g,"-")).replace(/^-|-$/g,"");
    if (!name || !slug) return;
    const row = { name, slug, description: String(fd.get("description") || ""), sort_order: modes.length + 1, enabled: true, logo_url: null };
    const client = getSiteClient();
    if (client) {
      const { data, error } = await client.from("gamemodes").insert(row).select().single();
      if (error) return notify(error.message);
      setModes(m=>[...m, data as GameMode]);
    } else {
      setModes(m=>[...m, { ...row, id: crypto.randomUUID() }]);
    }
    form.reset(); notify("Gamemode créé.");
  }

  async function deleteMode(id: string) {
    if (!canEdit || !confirm("Supprimer ce gamemode et ses rankings ?")) return;
    const client = getSiteClient();
    if (client) {
      const {error} = await client.from("gamemodes").delete().eq("id", id);
      if (error) return notify(error.message);
    }
    setModes(m=>m.filter(x=>x.id!==id)); setRankings(r=>r.filter(x=>x.gamemode_id!==id)); notify("Gamemode supprimé.");
  }

  async function uploadModeLogo(modeId: string, file: File) {
    if (!canEdit) return;
    const client = getSiteClient();
    if (!client) {
      const url = URL.createObjectURL(file);
      setModes(m=>m.map(g=>g.id===modeId?{...g,logo_url:url}:g));
      notify("Logo chargé (démo locale).");
      return;
    }
    const ext = file.name.split(".").pop() || "png";
    const path = `${modeId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await client.storage.from("gamemode-logos").upload(path, file, { upsert: true });
    if (upErr) return notify(upErr.message);
    const { data } = client.storage.from("gamemode-logos").getPublicUrl(path);
    const { error } = await client.from("gamemodes").update({logo_url:data.publicUrl}).eq("id",modeId);
    if (error) return notify(error.message);
    setModes(m=>m.map(g=>g.id===modeId?{...g,logo_url:data.publicUrl}:g));
    notify("Logo mis à jour.");
  }

  async function addTier(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canEdit) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const row = {
      code: String(fd.get("code")||"").toUpperCase().trim(),
      label: String(fd.get("label")||"").trim(),
      color: String(fd.get("color")||"#A78BFA"),
      points: Number(fd.get("points")||0),
      sort_order: tiers.length + 1
    };
    if (!row.code || !row.label) return;
    const client = getSiteClient();
    if (client) {
      const {data,error}=await client.from("tiers").insert(row).select().single();
      if(error) return notify(error.message);
      setTiers(t=>[...t,data as Tier]);
    } else setTiers(t=>[...t,{...row,id:crypto.randomUUID()}]);
    form.reset(); notify("Tier créé.");
  }

  async function deleteTier(id:string) {
    if(!canEdit || !confirm("Supprimer ce tier ? Les joueurs qui l'utilisent deviendront non classés.")) return;
    const client=getSiteClient();
    if(client){ const {error}=await client.from("tiers").delete().eq("id",id); if(error)return notify(error.message);}
    setTiers(t=>t.filter(x=>x.id!==id)); setRankings(r=>r.filter(x=>x.tier_id!==id)); notify("Tier supprimé.");
  }

  async function saveBranding(e: FormEvent) {
    e.preventDefault(); if(!canEdit)return;
    const client=getSiteClient();
    if(client){const {error}=await client.from("site_settings").upsert(settings); if(error)return notify(error.message);}
    notify("Identité du site enregistrée.");
  }

  async function saveMode(e: FormEvent) {
    e.preventDefault(); if (!canEdit || !editMode) return;
    const {data, error} = await getSiteClient().from("gamemodes").update(editMode).eq("id", editMode.id).select().single();
    if (error) return notify(error.message);
    setModes(previous => previous.map(mode => mode.id === data.id ? data : mode).sort((a,b)=>a.sort_order-b.sort_order));
    setEditMode(null); notify("Gamemode enregistré.");
  }

  async function saveTier(e: FormEvent) {
    e.preventDefault(); if (!canEdit || !editTier) return;
    const {data, error} = await getSiteClient().from("tiers").update(editTier).eq("id", editTier.id).select().single();
    if (error) return notify(error.message);
    setTiers(previous => previous.map(tier => tier.id === data.id ? data : tier).sort((a,b)=>a.sort_order-b.sort_order));
    setRankings(previous => previous.map(r=>r.tier_id===data.id ? {...r,points:data.points} : r));
    setEditTier(null); notify("Tier et points enregistrés.");
  }

  async function changeRole(userId:string,newRole:Role) {
    if(!isAdmin)return;
    const client=getSiteClient();
    if(client){const {error}=await client.from("user_roles").upsert({user_id:userId,role:newRole});if(error)return notify(error.message);}
    setProfiles(p=>p.map(x=>x.id===userId?{...x,role:newRole}:x));notify("Accès mis à jour.");
  }

  const filteredPlayers = useMemo(()=>players.filter(p=>p.username.toLowerCase().includes(playerSearch.toLowerCase())),[players,playerSearch]);

  if (loadError) return <main className="adminLoading"><BrandMark name={settings.site_name}/><p>{loadError}</p><button className="primaryButton" onClick={()=>window.location.reload()}>Réessayer</button></main>;
  if (!ready) return <main className="adminLoading"><BrandMark name={settings.site_name}/><span>Chargement du cockpit...</span></main>;

  return (
    <main className="adminPage" style={{"--accent":settings.accent_color} as React.CSSProperties}>
      <aside className="sidebar">
        <a href="/" className="sidebarBrand"><BrandMark name={settings.site_name} /></a>
        <div className="sideLabel">Gestion</div>
        <NavButton active={tab==="overview"} icon={<LayoutDashboard size={18}/>} onClick={()=>setTab("overview")}>Vue d'ensemble</NavButton>
        <NavButton active={tab==="players"} icon={<Users size={18}/>} onClick={()=>setTab("players")}>Joueurs</NavButton>
        <NavButton active={tab==="modes"} icon={<Gamepad2 size={18}/>} onClick={()=>setTab("modes")}>Gamemodes</NavButton>
        <NavButton active={tab==="tiers"} icon={<BadgePlus size={18}/>} onClick={()=>setTab("tiers")}>Tiers & points</NavButton>
        <div className="sideLabel">Site</div>
        {isAdmin && <NavButton active={tab==="discord"} icon={<Shield size={18}/>} onClick={()=>setTab("discord")}>Bot Discord · /rank</NavButton>}
        {isAdmin && <NavButton active={tab==="village"} icon={<Brush size={18}/>} onClick={()=>setTab("village")}>Le Village</NavButton>}
        {isAdmin && <NavButton active={tab==="videos"} icon={<Shield size={18}/>} onClick={()=>setTab("videos")}>Validation des vidéos</NavButton>}
        <NavButton active={tab==="branding"} icon={<Brush size={18}/>} onClick={()=>setTab("branding")}>Identité & contenu</NavButton>
        {isAdmin && <NavButton active={tab==="access"} icon={<UserCog size={18}/>} onClick={()=>setTab("access")}>Accès & rôles</NavButton>}
        <div className="sidebarBottom">
          <div className="roleCard"><Shield size={16}/><div><strong>{role}</strong><small>{demo?"Mode démo":"Compte connecté"}</small></div></div>
          <button onClick={logout}><LogOut size={17}/> Déconnexion</button>
        </div>
      </aside>

      <section className="adminContent">
        <div className="adminTopbar">
          <div><span className="adminBreadcrumb">{settings.site_name} / Administration</span><h1>{tabTitle(tab)}</h1></div>
          <a href="/" target="_blank" className="ghostButton">Voir le site ↗</a>
        </div>

        {tab==="discord" && isAdmin && <DiscordRankSettings/>}
        {tab==="village" && isAdmin && <VillageEditor/>}
        {tab==="videos" && isAdmin && <CommunityVideos moderation/>}

        {!canEdit && <div className="permissionWarning"><Shield size={18}/><span>Ton compte est en lecture seule. Un administrateur doit te donner le rôle “éditeur” ou “admin”.</span></div>}

        {tab==="overview" && <Overview players={players} modes={modes} tiers={tiers} rankings={rankings} setTab={setTab}/>}
        {tab==="players" && (
          <div className="adminGrid">
            <section className="adminPanel">
              <div className="panelHeading"><div><span className="sectionKicker">Ajout rapide</span><h2>Ajouter via NameMC</h2></div><Plus size={20}/></div>
              <div className="stackForm">
                <label>Lien NameMC ou pseudo<input value={playerInput} onChange={e=>setPlayerInput(e.target.value)} placeholder="https://namemc.com/profile/MonPseudo"/></label>
                <label>Région<select value={regionInput} onChange={e=>setRegionInput(e.target.value)}><option>EU</option><option>NA</option><option>AS</option><option>SA</option><option>OCE</option><option>Autre</option></select></label>
                <button disabled={!canEdit||resolving||!playerInput} onClick={resolvePlayer} className="secondaryButton">{resolving?"Recherche...":"Rechercher le joueur"}</button>
                {preview && <div className="playerPreview"><img src={preview.avatarUrl} alt=""/><div><strong>{preview.username}</strong><small>{preview.uuid}</small></div><button className="primaryButton" onClick={addPlayer}><Check size={16}/> Ajouter</button></div>}
              </div>
            </section>
            <section className="adminPanel wide">
              <div className="panelHeading"><div><span className="sectionKicker">Roster</span><h2>{players.length} joueurs</h2></div><div className="miniSearch"><Search size={15}/><input value={playerSearch} onChange={e=>setPlayerSearch(e.target.value)} placeholder="Rechercher"/></div></div>
              <div className="adminPlayerList">
                {filteredPlayers.map(player=>(
                  <div className="adminPlayer" key={player.id}>
                    <img src={head(player.minecraft_uuid)} alt=""/>
                    <div className="adminPlayerName"><strong>{player.username}</strong><small>{player.region || "—"}</small></div>
                    <div className="rankSelects">
                      {modes.filter(g=>g.enabled).map(g=>{
                        const r=rankings.find(r=>r.player_id===player.id&&r.gamemode_id===g.id);
                        return <label key={g.id} title={g.name}>{g.logo_url?<img src={g.logo_url} alt={g.name}/>:<span>{g.name.slice(0,2)}</span>}<select disabled={!canEdit} value={r?.tier_id||""} onChange={e=>setPlayerTier(player.id,g.id,e.target.value)}><option value="">—</option>{tiers.map(t=><option key={t.id} value={t.id}>{t.code}</option>)}</select></label>
                      })}
                    </div>
                    <button disabled={!canEdit} onClick={()=>deletePlayer(player.id)} className="iconDanger"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab==="modes" && (
          <div className="adminGrid">
            <section className="adminPanel">
              <div className="panelHeading"><div><span className="sectionKicker">Configuration</span><h2>Nouveau gamemode</h2></div><Gamepad2 size={20}/></div>
              <form className="stackForm" onSubmit={addMode}>
                <label>Nom<input name="name" required placeholder="Ex: Axe"/></label>
                <label>Slug<input name="slug" placeholder="axe"/></label>
                <label>Description<textarea name="description" placeholder="Courte description affichée sur le site."/></label>
                <button disabled={!canEdit} className="primaryButton"><Plus size={16}/> Ajouter le mode</button>
              </form>
            </section>
            <section className="adminPanel wide">
              <div className="panelHeading"><div><span className="sectionKicker">Modes actifs</span><h2>Logos & gamemodes</h2></div></div>
              <div className="modeAdminGrid">
                {modes.map(g=><div className="modeAdminCard" key={g.id}>
                  <div className="modeAdminLogo">{g.logo_url?<img src={g.logo_url} alt=""/>:<Gamepad2/>}</div>
                  <div><strong>{g.name}</strong><small>/{g.slug}</small><p>{g.description||"Aucune description"}</p></div>
                  <div className="modeActions">
                    <button className="uploadButton" disabled={!canEdit} onClick={()=>setEditMode({...g})}>Modifier</button>
                    <label className="uploadButton"><Upload size={15}/> Logo<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={!canEdit} onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value="";if(file)void uploadModeLogo(g.id,file);}}/></label>
                    <button className="iconDanger" disabled={!canEdit} onClick={()=>deleteMode(g.id)}><Trash2 size={15}/></button>
                  </div>
                  {editMode?.id === g.id && <form className="stackForm recordEditor" onSubmit={saveMode}>
                    <label>Nom<input required value={editMode.name} onChange={e=>setEditMode({...editMode,name:e.target.value})}/></label>
                    <label>Description<textarea value={editMode.description || ""} onChange={e=>setEditMode({...editMode,description:e.target.value})}/></label>
                    <label>Ordre<input type="number" min="0" max="10000" value={editMode.sort_order} onChange={e=>setEditMode({...editMode,sort_order:Number(e.target.value)})}/></label>
                    <label>Visibilité<select value={editMode.enabled ? "yes" : "no"} onChange={e=>setEditMode({...editMode,enabled:e.target.value === "yes"})}><option value="yes">Afficher le gamemode</option><option value="no">Masquer le gamemode</option></select></label>
                    <button className="primaryButton">Enregistrer</button><button type="button" className="textButton" onClick={()=>setEditMode(null)}>Annuler</button>
                  </form>}
                </div>)}
              </div>
            </section>
          </div>
        )}

        {tab==="tiers" && (
          <div className="adminGrid">
            <section className="adminPanel">
              <div className="panelHeading"><div><span className="sectionKicker">Barème</span><h2>Nouveau tier</h2></div><BadgePlus size={20}/></div>
              <form className="stackForm" onSubmit={addTier}>
                <label>Code<input name="code" required placeholder="HT1"/></label>
                <label>Nom<input name="label" required placeholder="High Tier 1"/></label>
                <div className="splitInputs"><label>Couleur<input name="color" type="color" defaultValue="#A78BFA"/></label><label>Points<input name="points" type="number" min="0" defaultValue="10"/></label></div>
                <button disabled={!canEdit} className="primaryButton"><Plus size={16}/> Ajouter le tier</button>
              </form>
            </section>
            <section className="adminPanel wide">
              <div className="panelHeading"><div><span className="sectionKicker">Ordre du ranking</span><h2>Tiers & points</h2></div></div>
              <div className="tierAdminList">
                {tiers.map((t,i)=><div key={t.id} className="tierAdminRow"><span className="dragIndex">{String(i+1).padStart(2,"0")}</span><span className="colorDot" style={{background:t.color}}/><strong>{t.code}</strong><span>{t.label}</span><b>{t.points} pts</b><div className="tierActions"><button className="uploadButton" disabled={!canEdit} onClick={()=>setEditTier({...t})}>Modifier</button><button disabled={!canEdit} onClick={()=>deleteTier(t.id)} className="iconDanger"><Trash2 size={15}/></button></div>
                  {editTier?.id === t.id && <form className="stackForm recordEditor" onSubmit={saveTier}>
                    <label>Code<input required value={editTier.code} onChange={e=>setEditTier({...editTier,code:e.target.value})}/></label>
                    <label>Nom<input required value={editTier.label} onChange={e=>setEditTier({...editTier,label:e.target.value})}/></label>
                    <div className="splitInputs"><label>Couleur<input type="color" value={editTier.color} onChange={e=>setEditTier({...editTier,color:e.target.value})}/></label><label>Points<input type="number" min="0" value={editTier.points} onChange={e=>setEditTier({...editTier,points:Number(e.target.value)})}/></label></div>
                    <label>Ordre<input type="number" min="0" value={editTier.sort_order} onChange={e=>setEditTier({...editTier,sort_order:Number(e.target.value)})}/></label>
                    <button className="primaryButton">Enregistrer</button><button type="button" className="textButton" onClick={()=>setEditTier(null)}>Annuler</button>
                  </form>}
                </div>)}
              </div>
            </section>
          </div>
        )}

        {tab==="branding" && (
          <section className="adminPanel brandingPanel">
            <div className="panelHeading"><div><span className="sectionKicker">Personnalisation</span><h2>Identité du site</h2></div><Settings2 size={20}/></div>
            <form onSubmit={saveBranding} className="brandingForm">
              <div className="formSection"><h3>Textes</h3><label>Nom du site<input value={settings.site_name} onChange={e=>setSettings({...settings,site_name:e.target.value})}/></label><label>Slogan<textarea value={settings.tagline} onChange={e=>setSettings({...settings,tagline:e.target.value})}/></label><label>Bannière d'annonce<input value={settings.announcement||""} onChange={e=>setSettings({...settings,announcement:e.target.value})} placeholder="Ex: Saison 2 ouverte !"/></label></div>
              <div className="formSection"><h3>Apparence & liens</h3><label>Couleur principale<div className="colorField"><input type="color" value={settings.accent_color} onChange={e=>setSettings({...settings,accent_color:e.target.value})}/><input value={settings.accent_color} onChange={e=>setSettings({...settings,accent_color:e.target.value})}/></div></label><label>Lien Discord<input value={settings.discord_url||""} onChange={e=>setSettings({...settings,discord_url:e.target.value})} placeholder="https://discord.gg/..."/></label><div className="brandPreview" style={{"--preview":settings.accent_color} as React.CSSProperties}><BrandMark name={settings.site_name}/><span>Aperçu de l'accent SheepTier</span></div></div>
              <div className="formSection"><h3>Page d'accueil</h3>
                <label>Titre principal<input value={settings.hero_title || ""} placeholder="Chaque combat" onChange={e=>setSettings({...settings,hero_title:e.target.value})}/></label>
                <label>Suite du titre<input value={settings.hero_highlight || ""} placeholder="laisse une trace." onChange={e=>setSettings({...settings,hero_highlight:e.target.value})}/></label>
                <label>Titre À propos<input value={settings.about_title || ""} placeholder="Compétitif sans être générique." onChange={e=>setSettings({...settings,about_title:e.target.value})}/></label>
                <label>Texte À propos<textarea value={settings.about_description || ""} onChange={e=>setSettings({...settings,about_description:e.target.value})}/></label>
              </div>
              <div className="formSection"><h3>Bien démarrer</h3><p className="accessInfo">Les quatre gamemodes et les tiers HT1 à LT5 sont déjà configurés. Modifie-les selon tes règles, importe tes logos puis ajoute tes joueurs. Le classement est vide au départ : aucun ranking d'exemple n'est publié.</p></div>
              <div className="formFooter"><button disabled={!canEdit} className="primaryButton"><Save size={16}/> Enregistrer</button></div>
            </form>
          </section>
        )}

        {tab==="access" && isAdmin && (
          <section className="adminPanel accessPanel">
            <div className="panelHeading"><div><span className="sectionKicker">Sécurité</span><h2>Comptes & permissions</h2></div><Shield size={20}/></div>
            <div className="accessInfo">Le classement est ouvert aux visiteurs. Le compte propriétaire est le seul autorisé à ouvrir l’administration et à modifier le site. Les autres comptes restent en lecture seule.</div>
            <OwnerAccountBinding/><div className="accessList">
              {profiles.length ? profiles.map(p=><div className="accessRow" key={p.id}><div className="userAvatar">{(p.email||"?")[0].toUpperCase()}</div><div><strong>{p.display_name||p.email||"Utilisateur"}</strong><small>{p.email}</small></div><span>{p.role === "admin" ? "Propriétaire" : "Lecture seule"}</span></div>) : <div className="emptyState">Aucun autre compte à afficher.</div>}
            </div>
          </section>
        )}
      </section>
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    </main>
  );
}

function NavButton({active,icon,onClick,children}:{active:boolean;icon:React.ReactNode;onClick:()=>void;children:React.ReactNode}) {
  return <button className={`navButton ${active?"active":""}`} onClick={onClick}>{icon}<span>{children}</span></button>
}
function tabTitle(tab:Tab){return ({overview:"Vue d'ensemble",players:"Joueurs & rankings",modes:"Gamemodes",tiers:"Tiers & points",branding:"Identité & contenu",access:"Accès & rôles",videos:"Validation des vidéos",village:"Le Village",discord:"Bot Discord · /rank"})[tab]}
function Overview({players,modes,tiers,rankings,setTab}:{players:Player[];modes:GameMode[];tiers:Tier[];rankings:Ranking[];setTab:(t:Tab)=>void}) {
  const ranked=new Set(rankings.map(r=>r.player_id)).size;
  const total=rankings.reduce((s,r)=>s+r.points,0);
  return <div className="overview">
    <div className="statCards"><Stat icon={<Users/>} value={players.length} label="Joueurs"/><Stat icon={<Gamepad2/>} value={modes.length} label="Gamemodes"/><Stat icon={<BadgePlus/>} value={tiers.length} label="Tiers"/><Stat icon={<Shield/>} value={total} label="Points distribués"/></div>
    <div className="overviewGrid"><section className="adminPanel"><div className="panelHeading"><div><span className="sectionKicker">Démarrage rapide</span><h2>Actions fréquentes</h2></div></div><div className="quickActions"><button onClick={()=>setTab("players")}><Plus/> Ajouter un joueur<span>via lien NameMC</span></button><button onClick={()=>setTab("modes")}><Upload/> Importer un logo<span>pour un gamemode</span></button><button onClick={()=>setTab("tiers")}><BadgePlus/> Modifier le barème<span>tiers & points</span></button><button onClick={()=>setTab("branding")}><Brush/> Personnaliser le site<span>textes & couleur</span></button></div></section>
    <section className="adminPanel"><div className="panelHeading"><div><span className="sectionKicker">Santé du ranking</span><h2>Couverture</h2></div></div><div className="healthRing"><strong>{players.length?Math.round((ranked/players.length)*100):0}%</strong><span>des joueurs ont au moins un tier</span></div></section></div>
  </div>
}
function Stat({icon,value,label}:{icon:React.ReactNode;value:number;label:string}){return <div className="statCard"><span>{icon}</span><strong>{value}</strong><small>{label}</small></div>}

