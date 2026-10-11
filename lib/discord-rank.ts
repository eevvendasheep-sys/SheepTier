import type { SiteDocument } from './store';
import type { MinecraftIdentity } from './minecraft-resolver';
import { APIError } from './model';
export const rankCodes = ['LT5','HT5','LT4','HT4','LT3','HT3','LT2','HT2','LT1','HT1'];
const normalize = (value:string) => value.toLowerCase().replace(/[^a-z0-9]/g,'');
const aliases:Record<string,string[]> = {
  nethshield:['nethshield'], manhunt:['manhunt'], dspear:['dspear','diamonspear','diamondspear'],
  spearsmp:['spearsmp'], ironpot:['ironpot'], dmace:['dmace','diamonmace','diamondmace']
};
export function rankTarget(doc:SiteDocument, mode:string, rank:string){
  if(!rankCodes.includes(rank))throw new APIError('Rang invalide : LT5 à HT1.');
  const key=normalize(mode), canonical=Object.entries(aliases).find(([,names])=>names.includes(key))?.[0]??key;
  const matches=doc.gamemodes.filter(g=>g.enabled&&[g.id,g.slug,g.name].some(v=>{
    const n=normalize(v);return n===key||n===canonical||(aliases[canonical]??[]).includes(n);
  }));
  if(matches.length!==1)throw new APIError('Gamemode absent, désactivé ou ambigu. Vérifie le panneau administrateur.');
  const tier=doc.tiers.find(t=>t.code.toUpperCase()===rank);
  if(!tier)throw new APIError('Ce rang n’existe pas sur le site.');
  return {mode:matches[0],tier};
}
export function applyDiscordRank(doc:SiteDocument, identity:MinecraftIdentity, modeName:string, rank:string, id:string, actor:string){
  const {mode,tier}=rankTarget(doc,modeName,rank);
  const previous=doc.discord_rank?.recent.find(r=>r.id===id);
  if(previous){
    if(previous.player!==identity.uuid||previous.mode!==mode.id||previous.tier!==tier.code||previous.actor!==actor)throw new APIError('Identifiant de commande déjà utilisé.',409);
    return {username:identity.username,gamemode:mode.name,rank:tier.code,duplicate:true};
  }
  let player=doc.players.find(p=>p.minecraft_uuid.replace(/-/g,'').toLowerCase()===identity.uuid);
  if(!player){player={id:crypto.randomUUID(),minecraft_uuid:identity.uuid,username:identity.username,namemc_url:identity.namemcUrl,skin_url:identity.skinUrl,region:null};doc.players.push(player);}
  else {player.username=identity.username;player.namemc_url=identity.namemcUrl;if(identity.skinUrl)player.skin_url=identity.skinUrl;}
  const existing=doc.rankings.find(r=>r.player_id===player.id&&r.gamemode_id===mode.id);
  const row={id:existing?.id??crypto.randomUUID(),player_id:player.id,gamemode_id:mode.id,tier_id:tier.id,points:tier.points,updated_at:new Date().toISOString()};
  doc.rankings=doc.rankings.filter(r=>r.player_id!==player.id||r.gamemode_id!==mode.id);doc.rankings.push(row);
  doc.discord_rank!.recent.push({id,actor,player:identity.uuid,mode:mode.id,tier:tier.code,at:row.updated_at});
  doc.discord_rank!.recent=doc.discord_rank!.recent.slice(-100);
  return {username:player.username,gamemode:mode.name,rank:tier.code,duplicate:false};
}
