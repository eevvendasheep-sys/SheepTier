import {serveLogo} from '@/lib/logo-storage';
export const dynamic='force-dynamic';
export async function GET(_r:Request,{params}:{params:Promise<{modeId:string;fileName:string}>}){const {modeId,fileName}=await params;return serveLogo(modeId+'/'+fileName);}
