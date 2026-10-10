export const dynamic='force-dynamic';
import CommunityShell from '@/components/CommunityShell';
import PlayerAccountPage from '@/components/PlayerAccountPage';
export const metadata={title:'Ton compte et ta progression — SheepTier'};
export default function Page(){return <CommunityShell><PlayerAccountPage/></CommunityShell>;}
