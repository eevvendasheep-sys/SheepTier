import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { readAdminSession } from '@/lib/admin-session';
export type ChatGPTUser={userId:string;displayName:string;email:string;fullName:string|null};
// Nom de compatibilité uniquement. Aucun header ChatGPT n'est accepté ici.
export async function getChatGPTUser():Promise<ChatGPTUser|null>{return readAdminSession((await headers()).get('cookie')||'');}
export async function requireChatGPTUser(_returnTo:string):Promise<ChatGPTUser>{const user=await getChatGPTUser();if(!user)redirect('/login');return user;}
export function chatGPTSignInPath(_returnTo:string){return '/login';}
export function chatGPTSignOutPath(_returnTo='/'){return '/login';}
