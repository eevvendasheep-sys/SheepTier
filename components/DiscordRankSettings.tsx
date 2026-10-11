'use client';
import {useState} from 'react';
export default function DiscordRankSettings(){
 const [guild,setGuild]=useState('1558112289947914410'),[token,setToken]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 async function configure(action:string){setBusy(true);setMessage('');setToken('');try{
  const response=await fetch('/api/discord-rank/key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,guild_id:guild})});const data=await response.json();if(!response.ok)throw Error(data.error);setToken(data.token??'');setMessage(action==='revoke'?'Connexion désactivée.':'Clé créée. Copie-la dans le bot ; elle ne sera plus affichée en quittant cette page.');
 }catch(e){setMessage(e instanceof Error?e.message:'Erreur de connexion.');}finally{setBusy(false);}}
 return <section className="adminCard"><h2>Discord · commande /rank</h2><p>Les modérateurs peuvent attribuer un tier depuis Discord. La clé autorise uniquement les changements de classement.</p><label>Identifiant du serveur Discord<input value={guild} onChange={e=>setGuild(e.target.value)} inputMode="numeric"/></label><p><button className="primaryButton" disabled={busy} onClick={()=>configure('create')}>Créer / renouveler la clé</button> <button className="ghostButton" disabled={busy} onClick={()=>configure('revoke')}>Désactiver la connexion</button></p>{token&&<label>Clé à copier dans le bot<input readOnly value={token} onFocus={e=>e.target.select()} spellCheck={false}/></label>}<p role="status">{message}</p><p>Une nouvelle clé remplace l’ancienne. Garde-la privée et ne la partage pas dans Discord.</p></section>;
}
