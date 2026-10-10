import {BrandMark} from './BrandMark';
import {NoteBlock} from './WorldExperience';
import CommunityNav from './CommunityNav';
export default function CommunityShell({children}:{children:React.ReactNode}){return <main className="communityPage"><header className="communityHeader"><a href="/" className="brandLink"><BrandMark/></a><NoteBlock/><CommunityNav/></header>{children}</main>;}
