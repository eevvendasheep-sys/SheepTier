import {env,storage} from '@/lib/netlify-env';
import {digest,randomToken} from '@/lib/player-account';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {ownerId} from '@/lib/store';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
class ClipError extends Error{constructor(message:string,public status=400){super(message);}}
const fail=(m:string,s=400):never=>{throw new ClipError(m,s);};
async function admin(){const u=await getChatGPTUser();return !!u&&u.userId===await ownerId();}
function origin(r:Request){if(r.headers.get('origin')!==new URL(r.url).origin)fail('Origine invalide.',403);}
function id(r:Request){const v=new URL(r.url).searchParams.get('id');if(!v||!uuid.test(v))fail('Clip invalide.');return v!;}
function error(e:unknown){return Response.json({error:e instanceof ClipError?e.message:'Le service vidéo est momentanément indisponible.'},{status:e instanceof ClipError?e.status:503,headers});}
type Row={id:string;title:string;author:string;status:string;object_key:string;mime:string;size:number;created_at:number};
export async function GET(r:Request){try{const p=new URL(r.url).searchParams;if(p.has('id')){const clip=await env.DB!.prepare('SELECT id, status, object_key, mime, size FROM community_clips WHERE id = ?').bind(id(r)).first<Row>();if(!clip||(clip.status!=='approved'&&!await admin()))fail('Clip introuvable.',404);const {data,error:signedError}=await storage().createSignedUrl(clip!.object_key,60);if(signedError||!data)fail('Vidéo introuvable.',404);return new Response(null,{status:307,headers:{Location:data!.signedUrl,'Cache-Control':'private, no-store'}});}
const moderation=p.get('moderation')==='1';if(moderation&&!await admin())fail('Accès réservé au propriétaire.',403);const cursor=Number(p.get('before')||Number.MAX_SAFE_INTEGER);if(!Number.isSafeInteger(cursor)||cursor<0)fail('Page invalide.');const rows=await env.DB!.prepare(`SELECT id, title, author, status, mime, size, created_at FROM community_clips WHERE ${moderation?'1=1':"status = 'approved'"} AND created_at < ? ORDER BY created_at DESC LIMIT 25`).bind(cursor).all<Row>();const clips=rows.results.slice(0,24);return Response.json({clips:clips.map(c=>({id:c.id,title:c.title,author:c.author,status:c.status,size:c.size,createdAt:c.created_at})),nextCursor:rows.results.length>24?clips.at(-1)!.created_at:null},{headers});}catch(e){return error(e);}}
export async function POST(r:Request){try{origin(r);if(Number(r.headers.get('content-length'))>4096)fail('Requête invalide.',413);const raw=await r.text();if(raw.length>4096)fail('Requête invalide.');const input=JSON.parse(raw);
if(input.action==='finish'){
 if(!uuid.test(input.id)||typeof input.token!=='string'||! /^[0-9a-f]{64}$/.test(input.token))fail('Envoi invalide.');
 const clip=await env.DB.prepare('SELECT * FROM community_clips WHERE id = ?').bind(input.id).first<Row & {upload_token_hash:string}>();
 if(!clip||clip!.status!=='uploading'||clip!.upload_token_hash!==await digest(input.token))fail('Envoi invalide.',403);
 const obj=await env.BUCKET.get(clip!.object_key);if(!obj)fail('Fichier absent.');
 const bytes=obj!.body.slice(0,16),mp4=String.fromCharCode(...bytes.slice(4,8))==='ftyp',webm=bytes[0]===0x1a&&bytes[1]===0x45&&bytes[2]===0xdf&&bytes[3]===0xa3;
 if(obj!.size!==clip!.size||obj!.size>20*1024*1024||obj!.size<16||!(clip!.mime==='video/mp4'?mp4:webm)){
  await env.BUCKET.delete(clip!.object_key);await env.DB.prepare('DELETE FROM community_clips WHERE id = ?').bind(clip!.id).run();fail('Fichier invalide : utilise MP4 ou WebM, 20 Mo maximum.');}
 const result=await env.DB.prepare("UPDATE community_clips SET status='pending',upload_token_hash=NULL WHERE id=? AND status='uploading' AND upload_token_hash=?").bind(clip!.id,clip!.upload_token_hash).run();
 if(result.meta.changes!==1)fail('Envoi déjà traité.',409);
 return Response.json({id:clip!.id,status:'pending'},{status:201,headers});
}
const clean=(v:unknown,max:number)=>{if(typeof v!=='string')fail('Texte invalide.');const s=(v as string).trim();if(s.length<2||s.length>max||/[<>\u0000-\u001f]/.test(s))fail('Texte invalide.');return s;};
const title=clean(input.title,80),author=clean(input.author,24),size=input.size,mime=input.mime;
if(!Number.isSafeInteger(size)||size<16||size>20*1024*1024||!['video/mp4','video/webm'].includes(mime))fail('MP4 ou WebM, 20 Mo maximum.');
if(!uuid.test(input.deviceId))fail('Identifiant invalide.');
const hash=await digest('SheepTier-clips:'+(r.headers.get('x-nf-client-connection-ip')||input.deviceId)),now=Date.now(),clipId=crypto.randomUUID(),key='clips/'+clipId,token=randomToken();
const inserted=await env.DB.prepare("INSERT INTO community_clips (id,title,author,status,object_key,mime,size,created_at,publisher_hash,upload_token_hash) SELECT ?,?,?,'uploading',?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM community_clips WHERE publisher_hash = ? AND created_at > ?) < 3 AND NOT EXISTS (SELECT 1 FROM community_clips WHERE publisher_hash = ? AND created_at > ?) AND (SELECT COUNT(*) FROM community_clips) < 500").bind(clipId,title,author,key,mime,size,now,hash,await digest(token),hash,now-86400000,hash,now-120000).run();
if(inserted.meta.changes!==1)fail('Attends 2 minutes entre deux clips, maximum 3 par jour. La galerie peut aussi être pleine.',429);
const {data,error:uploadError}=await storage().createSignedUploadUrl(key,{upsert:false});
if(uploadError||!data){await env.DB.prepare('DELETE FROM community_clips WHERE id=?').bind(clipId).run();fail('Envoi indisponible.',503);}
return Response.json({id:clipId,token,uploadURL:data!.signedUrl},{status:201,headers});
}catch(e){return error(e);}}
export async function PATCH(r:Request){try{origin(r);if(!await admin())fail('Seul le propriétaire peut valider un clip.',403);const raw=await r.text();if(raw.length>256)fail('Requête invalide.');let input;try{input=JSON.parse(raw);}catch{fail('Requête invalide.');}if(!['approved','pending'].includes(input.status))fail('Statut invalide.');const result=await env.DB!.prepare("UPDATE community_clips SET status = ? WHERE id = ? AND status IN ('pending','approved')").bind(input.status,id(r)).run();if(result.meta.changes!==1)fail('Clip introuvable.',404);return Response.json({updated:true},{headers});}catch(e){return error(e);}}
export async function DELETE(r:Request){try{origin(r);if(!await admin())fail('Seul le propriétaire peut retirer un clip.',403);const clip=await env.DB!.prepare('SELECT object_key FROM community_clips WHERE id = ?').bind(id(r)).first<Row>();if(!clip)fail('Clip introuvable.',404);await env.DB!.prepare('DELETE FROM community_clips WHERE id = ?').bind(id(r)).run();await env.BUCKET!.delete(clip!.object_key);return Response.json({deleted:true},{headers});}catch(e){return error(e);}}
