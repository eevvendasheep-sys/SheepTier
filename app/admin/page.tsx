import AdminDashboard from "@/components/AdminDashboard";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { ownerId } from "@/lib/store";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  if (user.userId !== await ownerId()) redirect("/");
  return <AdminDashboard/>;
}
