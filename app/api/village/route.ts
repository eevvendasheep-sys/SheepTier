import {getChatGPTUser} from '@/app/chatgpt-auth';
import {readDocument,changeDocument,ownerId} from '@/lib/store';
import {defaultVillage,validateVillage} from '@/lib/village';
import {isSameSiteRequest} from '@/lib/request-origin';
import {readInput,AccountError} from '@/lib/player-account';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(){try{const {document}=await readDocument();return Response.json({world:document.village??defaultVillage(),revision:document.village_revision??0},{headers});}catch{return Response.json({error:'Le village est momentanément indisponible.'},{status:503,headers});}}
export async function PUT(request:Request){
 try{
  if(!isSameSiteRequest(request))return Response.json({error:'Origine invalide.'},{status:403,headers});
  const user=await getChatGPTUser();if(!user)return Response.json({error:'Connexion requise.'},{status:401,headers});
  if(user.userId!==await ownerId())return Response.json({error:'Seul le propriétaire peut publier le village.'},{status:403,headers});
  const input=await readInput(request,250000);if(!Number.isSafeInteger(input.revision)||input.revision<0)throw new AccountError('Révision invalide.');
  let world;try{world=validateVillage(input.world);}catch(e){throw new AccountError(e instanceof Error?e.message:'Carte invalide.');}
  const revision=await changeDocument(doc=>{if((doc.village_revision??0)!==input.revision)throw new AccountError('Le village a été modifié ailleurs. Recharge la carte avant de publier.',409);doc.village=world;doc.village_revision=input.revision+1;return doc.village_revision;});
  return Response.json({world,revision},{headers});
 }catch(e){return Response.json({error:e instanceof AccountError?e.message:'Impossible de publier le village. Réessaie.'},{status:e instanceof AccountError?e.status:503,headers});}
}
