import { ownerId } from "@/lib/store";
export const dynamic = "force-dynamic";
// Safe readiness diagnostic: no identity, email, roster or roles are exposed.
export async function GET() {
  const configured = Boolean(await ownerId());
  return Response.json({ ownerConfigured: configured, administration: "owner-only" }, {
    status: configured ? 200 : 503, headers: { "Cache-Control": "no-store" }
  });
}
