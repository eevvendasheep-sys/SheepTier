import { resolveMinecraftProfile, MinecraftLookupError } from "@/lib/minecraft-resolver";
export const dynamic = "force-dynamic";
// Read-only service check against a fixed public fixture. No user data or writes.
// The hosting audience (currently owner-private) continues to protect this route.
export async function GET() {
  const checks: Array<{ provider: string; outcome: string; status?: number; error?: string }> = [];
  try {
    await resolveMinecraftProfile('https://namemc.com/profile/Notch.1', (url, init) => globalThis.fetch(url, init), diagnostic => checks.push(diagnostic));
    return Response.json({ ok: true, checks }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ ok: false, checks }, { status: error instanceof MinecraftLookupError ? error.status : 502,
      headers: { 'Cache-Control': 'no-store' } });
  }
}
