import { env } from "@/lib/netlify-env";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ownerId } from "@/lib/store";
import { validateLevel, verifyReplay, type PlatformLevel } from "@/lib/platformer";
export const dynamic = "force-dynamic";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const noStore = { "Cache-Control": "no-store" };
class LevelError extends Error { constructor(message: string, public status=400){super(message);} }
function sameOrigin(request: Request) { if(request.headers.get("origin")!==new URL(request.url).origin)throw new LevelError("Origine de requête invalide.",403); }
function clean(value: unknown, label: string, max: number) {
  if(typeof value!=="string")throw new LevelError(`${label} manquant.`);
  const text=value.trim().replace(/\s+/g," ");
  if(text.length<2||text.length>max||/[<>\u0000-\u001f]/.test(text))throw new LevelError(`${label} : entre 2 et ${max} caractères, sans balises.`);
  return text;
}
async function canModerate() { const user=await getChatGPTUser();return !!user && user.userId===await ownerId(); }
export async function GET(request: Request) {
  try {
    const params=new URL(request.url).searchParams;
    const id=params.get("id");
    if(id){if(!uuid.test(id))throw new LevelError("Niveau invalide.");const row=await env.DB!.prepare("SELECT id, title, author, level, created_at FROM community_levels WHERE id = ?").bind(id).first<{id:string;title:string;author:string;level:string;created_at:number}>();if(!row)throw new LevelError("Ce niveau n’est plus disponible.",404);return Response.json({levels:[{id:row.id,title:row.title,author:row.author,createdAt:row.created_at,level:JSON.parse(row.level)}],nextCursor:null,canModerate:await canModerate()},{headers:noStore});}
    const cursor=params.get("cursor");
    let beforeTime=Number.MAX_SAFE_INTEGER,beforeId="ffffffff-ffff-ffff-ffff-ffffffffffff";
    if(cursor){const [time,id]=cursor.split("_");beforeTime=Number(time);if(!Number.isSafeInteger(beforeTime)||beforeTime<0||!uuid.test(id||""))throw new LevelError("Page invalide.");beforeId=id;}
    const rows=await env.DB!.prepare("SELECT id, title, author, level, created_at FROM community_levels WHERE created_at < ? OR (created_at = ? AND id < ?) ORDER BY created_at DESC, id DESC LIMIT 19").bind(beforeTime,beforeTime,beforeId).all<{id:string;title:string;author:string;level:string;created_at:number}>();
    const page=rows.results.slice(0,18);const last=page.at(-1);
    return Response.json({ levels:page.map(row=>({id:row.id,title:row.title,author:row.author,createdAt:row.created_at,level:JSON.parse(row.level)})),nextCursor:rows.results.length>18&&last?`${last.created_at}_${last.id}`:null,canModerate:await canModerate() },{headers:noStore});
  } catch(error) { return Response.json({error:error instanceof LevelError?error.message:"La galerie est momentanément indisponible."},{status:error instanceof LevelError?error.status:503,headers:noStore}); }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if(Number(request.headers.get("content-length"))>90000)throw new LevelError("Niveau trop volumineux.",413);
    const raw=await request.text();if(raw.length>90000)throw new LevelError("Niveau trop volumineux.",413);
    const input=JSON.parse(raw);if(!input||typeof input!=="object"||Array.isArray(input))throw new LevelError("Publication invalide.");const title=clean(input.title,"Titre",60),author=clean(input.author,"Pseudo",24);
    if(typeof input.id!=="string"||!uuid.test(input.id)||typeof input.deviceId!=="string"||!uuid.test(input.deviceId))throw new LevelError("Identifiant de publication invalide.");
    let level: PlatformLevel;
    try { level=validateLevel(input.level); } catch(error) { throw new LevelError(error instanceof Error?error.message:"Niveau invalide."); }
    if(!verifyReplay(level,input.replay))throw new LevelError("Termine ce niveau dans le mode test avant de le publier.");
    const fingerprint=request.headers.get("cf-connecting-ip")||input.deviceId;
    const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("SheepTier-public-levels:"+fingerprint));
    const publisherHash=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,"0")).join("");
    const existing=await env.DB!.prepare("SELECT id, title, author, level, publisher_hash FROM community_levels WHERE id = ?").bind(input.id).first<{id:string;title:string;author:string;level:string;publisher_hash:string}>();
    const serialized=JSON.stringify(level);
    if(existing){if(existing.publisher_hash!==publisherHash||existing.level!==serialized||existing.title!==title||existing.author!==author)throw new LevelError("Cet identifiant est déjà utilisé.",409);return Response.json({id:existing.id},{headers:noStore});}
    const now=Date.now();
    const inserted=await env.DB!.prepare("INSERT INTO community_levels (id, title, author, level, created_at, publisher_hash) SELECT ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM community_levels WHERE publisher_hash = ? AND created_at > ?) < 5 AND NOT EXISTS (SELECT 1 FROM community_levels WHERE publisher_hash = ? AND created_at > ?) AND (SELECT COUNT(*) FROM community_levels) < 2000").bind(input.id,title,author,serialized,now,publisherHash,publisherHash,now-86400000,publisherHash,now-120000).run();
    if(inserted.meta.changes!==1)throw new LevelError("Publication limitée : attends 2 minutes entre deux niveaux (5 par jour). La galerie peut aussi avoir atteint sa capacité.",429);
    return Response.json({id:input.id},{status:201,headers:noStore});
  } catch(error) { const status=error instanceof LevelError?error.status:error instanceof SyntaxError?400: error instanceof Error && /niveau|départ|cases/.test(error.message)?400:503;return Response.json({error:status===503?"La publication est momentanément indisponible.":error instanceof Error?error.message:"Publication impossible."},{status,headers:noStore}); }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);if(!await canModerate())throw new LevelError("Seul le propriétaire peut retirer un niveau.",403);
    const id=new URL(request.url).searchParams.get("id");if(!id||!uuid.test(id))throw new LevelError("Niveau invalide.");
    await env.DB!.prepare("DELETE FROM community_levels WHERE id = ?").bind(id).run();
    return Response.json({deleted:true},{headers:noStore});
  } catch(error) { return Response.json({error:error instanceof LevelError?error.message:"Suppression impossible."},{status:error instanceof LevelError?error.status:503,headers:noStore}); }
}
