import { getChatGPTUser } from "@/app/chatgpt-auth";
import { registerUser, ownerId } from "@/lib/store";
export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  await registerUser(user);
  const role = user.userId === await ownerId() ? "admin" : "viewer";
  return Response.json({ user: { id: user.userId, email: user.email, role } }, { headers: { "Cache-Control": "no-store" } });
}
