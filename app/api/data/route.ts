import {isSameSiteRequest} from '@/lib/request-origin';
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { changeDocument, readDocument, ownerId } from "@/lib/store";
import { applyOperation, APIError, type Operation } from "@/lib/model";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 20000) throw new APIError("Données trop volumineuses.", 413);
    const operation: Operation = JSON.parse(raw);
    if (operation.operation !== 'select' && !isSameSiteRequest(request))
      throw new APIError("Origine de requête invalide.", 403);
    const user = await getChatGPTUser();
    const owner = await ownerId();
    const data = operation.operation === 'select'
      ? applyOperation((await readDocument()).document, operation, user?.userId, owner)
      : await changeDocument(doc => applyOperation(doc, operation, user?.userId, owner));
    return Response.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erreur inconnue." },
      { status: error instanceof APIError ? error.status : 400 });
  }
}
