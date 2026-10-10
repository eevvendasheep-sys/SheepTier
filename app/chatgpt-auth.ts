import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { readDocument } from '@/lib/store';
import { accountFromRequest } from '@/lib/player-account';
import { readAdminSession } from '@/lib/admin-session';
export type ChatGPTUser={userId:string;displayName:string;email:string;fullName:string|null};
// Nom de compatibilité uniquement. Aucun header ChatGPT n'est accepté ici.
export async function getChatGPTUser():Promise<ChatGPTUser|null>{const cookie=(await headers()).get('cookie')||'';const {document}=await readDocument();if(!document.admin_player_id)return readAdminSession(cookie);const account=await accountFromRequest(new Request('https://sheeptier-580e077a.netlify.app',{headers:{cookie}}));return account?.id===document.admin_player_id?{userId:'cloudflare-owner',displayName:account.username,email:'proprietaire@sheeptier.local',fullName:null}:null;}
export async function requireChatGPTUser(_returnTo:string):Promise<ChatGPTUser>{const user=await getChatGPTUser();if(!user)redirect('/login');return user;}
export function chatGPTSignInPath(_returnTo:string){return '/login';}
export function chatGPTSignOutPath(_returnTo='/'){return '/login';}
