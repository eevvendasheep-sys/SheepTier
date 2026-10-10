export const dynamic='force-dynamic';
import CommunityShell from '@/components/CommunityShell';
import CommunityVideos from '@/components/CommunityVideos';
export const metadata={title:'Vidéos de la communauté — SheepTier'};
export default function Page(){return <CommunityShell><CommunityVideos/></CommunityShell>;}
