import CommunityShell from '@/components/CommunityShell';
import {readDocument} from '@/lib/store';
import {MessagesSquare,ExternalLink} from 'lucide-react';
export const dynamic='force-dynamic';
export const metadata={title:'Discord — SheepTier'};
export default async function Page(){let link:string|null=null,error=false;try{link=(await readDocument()).document.site_settings[0]?.discord_url||null;}catch{error=true;}return <CommunityShell><section className="discordHero"><div className="discordOrb"><MessagesSquare size={58}/></div><span className="sectionKicker">Le camp de base du troupeau</span><h1>On se retrouve sur Discord.</h1><p>Partage tes niveaux, montre tes meilleurs clips et retrouve la communauté entre deux parties.</p>{link?<a className="primaryButton" href={link} target="_blank" rel="noopener noreferrer">Rejoindre le serveur<ExternalLink size={18}/></a>:<p className="clipEmpty">{error?'Le lien ne peut pas être chargé pour le moment. Réessaie plus tard.':'Le serveur arrive bientôt. Le berger ajoutera son invitation ici.'}</p>}<a href="/videos" className="secondaryButton">Découvrir les clips</a></section></CommunityShell>;}
