import {serveLogo} from '@/lib/logo-storage';
import {isSameSiteRequest} from '@/lib/request-origin';
import { env } from "@/lib/netlify-env";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { readDocument, ownerId } from "@/lib/store";
export const dynamic = "force-dynamic";
export async function GET(request:Request){return serveLogo(new URL(request.url).searchParams.get('path')||'');}
export async function POST(request: Request) {
  try {
    if (!isSameSiteRequest(request)) return Response.json({ error: "Origine invalide." }, { status: 403 });
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Connexion requise." }, { status: 401 });
    const { document } = await readDocument();
    if (user.userId !== await ownerId()) return Response.json({ error: "Import réservé au propriétaire." }, { status: 403 });
    if (Number(request.headers.get('content-length') || 0) > 2_200_000) return Response.json({ error: "Logo trop volumineux (2 Mo maximum)." }, { status: 413 });
    const form = await request.formData(); const file = form.get('file'); const path = String(form.get('path') || '');
    if (!(file instanceof File) || file.size > 2_000_000 || !/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(path))
      return Response.json({ error: "Logo invalide (2 Mo maximum)." }, { status: 400 });
    if (!document.gamemodes.some(g => g.id === path.split('/')[0])) return Response.json({ error: "Gamemode introuvable." }, { status: 400 });
    const bytes = new Uint8Array(await file.arrayBuffer());
    const png = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
    const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const header = new TextDecoder().decode(bytes.slice(0, 12));
    const gif = header.startsWith('GIF87a') || header.startsWith('GIF89a');
    const webp = header.startsWith('RIFF') && header.slice(8, 12) === 'WEBP';
    const type = png ? 'image/png' : jpg ? 'image/jpeg' : gif ? 'image/gif' : webp ? 'image/webp' : null;
    if (!type) return Response.json({ error: "Importe un logo PNG, JPEG, GIF ou WebP." }, { status: 400 });
    if (!env.BUCKET) throw new Error("Stockage indisponible.");
    await env.BUCKET.put('logos/' + path, bytes, { httpMetadata: { contentType: type } });
    return Response.json({ success: true });
  } catch { return Response.json({ error: "Impossible d'importer le logo." }, { status: 400 }); }
}
