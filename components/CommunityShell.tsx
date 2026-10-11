import {BrandMark} from './BrandMark';
import {NoteBlock} from './WorldExperience';
import CommunityNav from './CommunityNav';
export default function CommunityShell({children,music=true}:{children:React.ReactNode;music?:boolean}){return <main className="communityPage"><header className="communityHeader"><a href="/" className="brandLink"><BrandMark/></a>{music&&<NoteBlock/>}<CommunityNav/></header>{children}</main>;}

