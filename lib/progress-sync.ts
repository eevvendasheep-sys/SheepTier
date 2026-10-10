import type {CloudProgress} from './cloud-progress';
export type ProgressBase={id:string;revision:number;data:string;pending?:{revision:number;data:string}};
export type RemoteProgress={revision:number;progress:CloudProgress};
export function reconcileProgress(id:string,base:ProgressBase|null,local:CloudProgress,remote:RemoteProgress){
 const remoteData=JSON.stringify(remote.progress),localData=JSON.stringify(local);
 // A page may close after its save was accepted but before the response arrived.
 if(base?.id===id&&base.pending&&remote.revision===base.pending.revision+1&&remoteData===base.pending.data)base={id,revision:remote.revision,data:remoteData};
 const own=base?.id===id;
 const conflict=!!own&&localData!==base!.data&&remote.revision!==base!.revision&&remoteData!==localData;
 const keepLocal=!!own&&remote.revision===base!.revision&&localData!==base!.data;
 return {conflict,progress:keepLocal?local:remote.progress,base:{id,revision:remote.revision,data:remoteData} as ProgressBase};
}
