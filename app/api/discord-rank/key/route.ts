import {getChatGPTUser} from '@/app/chatgpt-auth';
import {ownerId,changeDocument} from '@/lib/store';
import {sameOrigin,readInput,randomToken,digest,AccountError,privateHeaders} from '@/lib/player-account';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
  sameOrigin(request);
  const user=await getChatGPTUser();if(!user||user.userId!==await ownerId())throw new AccountError('Réservé au propriétaire du site.',403);
  const input=await readInput(request,1000);
  if(input.action==='revoke'){await changeDocument(doc=>{delete doc.discord_rank;});return Response.json({ok:true},{headers:privateHeaders});}
  if(typeof input.guild_id!=='string'||!/^\d{17,20}$/.test(input.guild_id))throw new AccountError('Identifiant Discord du serveur invalide.');
  const token=randomToken(),hash=await digest(token);
  await changeDocument(doc=>{doc.discord_rank={guild_id:input.guild_id,token_hash:hash,recent:doc.discord_rank?.recent??[]};});
  return Response.json({token},{headers:privateHeaders});
}catch(error){return Response.json({error:error instanceof AccountError?error.message:'Impossible de configurer la connexion.'},{status:error instanceof AccountError?error.status:503,headers:privateHeaders});}}
