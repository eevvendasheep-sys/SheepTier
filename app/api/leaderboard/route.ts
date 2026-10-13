import {readDocument} from '@/lib/store';
import {publicLeaderboard} from '@/lib/public-leaderboard';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 const {document,revision}=await readDocument(),etag=`"ranking-${revision}"`;
 const headers={'Cache-Control':'public, max-age=0, s-maxage=5, must-revalidate','ETag':etag};
 if(request.headers.get('if-none-match')===etag)return new Response(null,{status:304,headers});
 return Response.json(publicLeaderboard(document),{headers});
}catch{return Response.json({error:'Classement momentanément indisponible.'},{status:503,headers:{'Cache-Control':'no-store'}});}}
