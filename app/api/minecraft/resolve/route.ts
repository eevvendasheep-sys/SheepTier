import { resolveMinecraftProfile, MinecraftLookupError } from "@/lib/minecraft-resolver";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ownerId } from "@/lib/store";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Connexion requise." }, { status: 401 });
  if (user.userId !== await ownerId()) return Response.json({ error: "Accès réservé au propriétaire." }, { status: 403 });
  const input = new URL(request.url).searchParams.get('input') || '';
  try {
    const profile = await resolveMinecraftProfile(input, (url, init) => globalThis.fetch(url, init), diagnostic => {
      if (diagnostic.outcome !== 'success') console.warn('minecraft_lookup', JSON.stringify(diagnostic));
    });
    return Response.json(profile, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Profil introuvable." },
      { status: error instanceof MinecraftLookupError ? error.status : 400 });
  }
}
