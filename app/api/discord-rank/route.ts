import {timingSafeEqual} from 'node:crypto';
import {readDocument,changeDocument,type SiteDocument} from '@/lib/store';
import {digest,readInput,AccountError,privateHeaders} from '@/lib/player-account';
import {APIError} from '@/lib/model';
import {resolveMinecraftProfile,MinecraftLookupError,type MinecraftIdentity} from '@/lib/minecraft-resolver';
import {rankTarget,applyDiscordRank} from '@/lib/discord-rank';
export const dynamic='force-dynamic';
export const runtime='nodejs';
function authorize(doc:SiteDocument,hash:string,guild:string){
  const link=doc.discord_rank;
  if(!link||link.guild_id!==guild||!/^[a-f0-9]{64}$/.test(link.token_hash)||!timingSafeEqual(Buffer.from(link.token_hash,'hex'),Buffer.from(hash,'hex')))throw new APIError('Connexion du bot non autorisée. Configure ou renouvelle sa clé dans le panneau administrateur.',401);
}
export async function POST(request:Request){try{
  const token=request.headers.get('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if(!token)throw new APIError('Authentification du bot requise.',401);
  const input=await readInput(request,2000);
  if(!input||typeof input!=='object'||typeof input.pseudo!=='string'||!/^[A-Za-z0-9_]{1,16}$/.test(input.pseudo)||typeof input.gamemode!=='string'||input.gamemode.length>80||typeof input.rank!=='string'||!/^\d{17,20}$/.test(input.guild_id??'')||!/^\d{17,20}$/.test(input.actor_id??'')||!/^\d{17,20}$/.test(input.interaction_id??''))throw new APIError('Pseudo ou paramètres de commande invalides.');
  const hash=await digest(token),{document}=await readDocument();authorize(document,hash,input.guild_id);
  const rank=input.rank.toUpperCase();rankTarget(document,input.gamemode,rank);
  let identity:MinecraftIdentity;
  try{identity=await resolveMinecraftProfile(input.pseudo);}catch(e){
    if(!(e instanceof MinecraftLookupError)||e.status===404)throw e;
    const known=document.players.filter(p=>p.username.toLowerCase()===input.pseudo.toLowerCase());
    if(known.length!==1)throw e;
    const p=known[0];identity={uuid:p.minecraft_uuid.replace(/-/g,''),username:p.username,namemcUrl:p.namemc_url??`https://namemc.com/profile/${p.username}`,skinUrl:p.skin_url,avatarUrl:'',bodyUrl:''};
  }
  const result=await changeDocument(doc=>{authorize(doc,hash,input.guild_id);return applyDiscordRank(doc,identity,input.gamemode,rank,input.interaction_id,input.actor_id);});
  return Response.json({ok:true,...result},{headers:privateHeaders});
}catch(e){const known=e instanceof APIError||e instanceof AccountError||e instanceof MinecraftLookupError;return Response.json({error:known?e.message:'Classement momentanément indisponible. Réessaie.'},{status:known?e.status:503,headers:privateHeaders});}}
