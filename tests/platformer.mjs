import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const url='data:text/javascript;base64,'+Buffer.from(compile(await readFile('lib/platformer.ts','utf8'))).toString('base64');
const {blankLevel,validateLevel,campaignLevels,newPlatformState,stepPlatform,tileAt,appendReplay,verifyReplay}=await import(url);
function solve(level){const s=newPlatformState(level),replay=[];for(let i=0;i<6000&&!s.dead&&!s.won;i++){let mask=2;if(s.grounded){const floor=Math.floor(s.y+.86),ahead=s.x+1.4;const support=[0,1,2].some(d=>[1,2,7].includes(tileAt(level,ahead,floor+d))),obstacle=tileAt(level,ahead,Math.floor(s.y+.4));if(!support||[2,3].includes(obstacle))mask|=4;}appendReplay(replay,mask);stepPlatform(level,s,mask);}return {state:s,replay};}
for(const campaign of campaignLevels){validateLevel(campaign.level);const result=solve(campaign.level);assert.equal(result.state.won,true,'Unfinishable campaign: '+campaign.id);assert.equal(verifyReplay(campaign.level,result.replay),true);const again=solve(campaign.level);assert.deepEqual(again,result);}
const base=blankLevel(24);const jump=newPlatformState(base);stepPlatform(base,jump,4);assert.ok(jump.vy<0);const velocity=jump.vy;stepPlatform(base,jump,4);assert.ok(jump.vy>velocity,'Held jump must not double-jump');
const spike=blankLevel(24);spike.tiles[13*24+6]=3;const dead=newPlatformState(spike);for(let i=0;i<200&&!dead.dead;i++)stepPlatform(spike,dead,2);assert.equal(dead.dead,true);assert.equal(dead.won,false);
const bounce=blankLevel(24);bounce.tiles[14*24+2]=7;const bounced=newPlatformState(bounce);stepPlatform(bounce,bounced,0);assert.equal(bounced.vy,-15);assert.equal(bounced.grounded,false);
const wall=blankLevel(24);wall.tiles[13*24+4]=2;const blocked=newPlatformState(wall);for(let i=0;i<200;i++)stepPlatform(wall,blocked,2);assert.ok(blocked.x<=3.35001);
const missing=blankLevel(24);missing.tiles[missing.tiles.indexOf(5)]=0;assert.throws(()=>validateLevel(missing),/départ/);assert.doesNotThrow(()=>validateLevel(missing,false));
assert.throws(()=>validateLevel({...base,width:999999}),/cases/);assert.throws(()=>validateLevel({...base,tiles:base.tiles.map(()=>21)}),/cases/);assert.throws(()=>validateLevel({...base,theme:'unknown'}),/cases/);
const proof=solve(base).replay;assert.equal(verifyReplay(base,proof),true);assert.equal(verifyReplay(base,[[2,10801]]),false);assert.equal(verifyReplay(base,[[16,200]]),false);assert.equal(verifyReplay(base,[[2,-1]]),false);assert.equal(verifyReplay(base,[[0,20]]),false);assert.equal(verifyReplay(base,null),false);

// Exercise the real route SQL using SQLite and the same verification engine.
const {DatabaseSync}=await import('node:sqlite');const sql=new DatabaseSync(':memory:');sql.exec((await readFile('drizzle/0001_grey_reavers.sql','utf8')).replaceAll('--> statement-breakpoint',''));
globalThis.platformTestEnv={DB:{prepare(query){const statement=sql.prepare(query);let values=[];return {bind(...args){values=args;return this;},async run(){const result=statement.run(...values);return {meta:{changes:Number(result.changes)}};},async first(){return statement.get(...values)||null;},async all(){return {results:statement.all(...values)};}};}}};
globalThis.platformTestUser=null;
let route=await readFile('app/api/community-levels/route.ts','utf8');route=route.replace('import { env } from "cloudflare:workers";','const env=globalThis.platformTestEnv;').replace('import { getChatGPTUser } from "@/app/chatgpt-auth";','const getChatGPTUser=async()=>globalThis.platformTestUser;').replace('import { ownerId } from "@/lib/store";','const ownerId=async()=>"owner";').replace('"@/lib/platformer"',JSON.stringify(url));
const api=await import('data:text/javascript;base64,'+Buffer.from(compile(route)).toString('base64'));
const origin='https://example.test';const deviceId=crypto.randomUUID();let clock=Date.now();const now=Date.now;Date.now=()=>clock;
const payload={id:crypto.randomUUID(),deviceId,title:'Ma première aventure',author:'Testeur',level:base,replay:proof};
const post=(body=payload,withOrigin=true)=>api.POST(new Request(origin+'/api/community-levels',{method:'POST',headers:{'Content-Type':'application/json',...(withOrigin?{Origin:origin}:{})},body:JSON.stringify(body)}));
assert.equal((await post(payload,false)).status,403);
assert.equal((await post({...payload,replay:[[0,3]]})).status,400);
assert.equal((await post({...payload,title:'<script>alert(1)</script>'})).status,400);
assert.equal((await post({...payload,level:missing})).status,400);
assert.equal((await post(null)).status,400);
const created=await post();assert.equal(created.status,201);const id=(await created.json()).id;
assert.equal((await post()).status,200,'Retries must not duplicate a publication');
assert.equal((await post({...payload,id:crypto.randomUUID()})).status,429);
for(let i=1;i<5;i++){clock+=121000;assert.equal((await post({...payload,id:crypto.randomUUID()})).status,201);}
clock+=121000;assert.equal((await post({...payload,id:crypto.randomUUID()})).status,429,'Daily limit');
const detail=await api.GET(new Request(origin+'/api/community-levels?id='+id));assert.equal(detail.status,200);const publicData=await detail.json();assert.equal(publicData.levels[0].id,id);assert.equal(publicData.canModerate,false);assert.ok(!JSON.stringify(publicData).includes('publisher_hash'));
for(let i=0;i<21;i++)sql.prepare('INSERT INTO community_levels VALUES (?, ?, ?, ?, ?, ?)').run(crypto.randomUUID(),'Pagination '+i,'Testeur',JSON.stringify(base),clock+i,'other');
const gallery=await (await api.GET(new Request(origin+'/api/community-levels'))).json();assert.equal(gallery.levels.length,18);assert.ok(gallery.nextCursor);
const next=await (await api.GET(new Request(origin+'/api/community-levels?cursor='+encodeURIComponent(gallery.nextCursor)))).json();assert.ok(next.levels.length>0);assert.ok(next.levels.every(row=>!gallery.levels.some(r=>r.id===row.id)));
const del=(withOrigin=true)=>api.DELETE(new Request(origin+'/api/community-levels?id='+id,{method:'DELETE',headers:withOrigin?{Origin:origin}:{}}));
assert.equal((await del()).status,403);globalThis.platformTestUser={userId:'editor'};assert.equal((await del()).status,403);globalThis.platformTestUser={userId:'other-admin'};assert.equal((await del()).status,403);globalThis.platformTestUser={userId:'owner'};assert.equal((await del(false)).status,403);assert.equal((await del()).status,200);assert.equal((await api.GET(new Request(origin+'/api/community-levels?id='+id))).status,404);
Date.now=now;sql.close();
console.log('Verified: all three adventures finishable, deterministic replay proofs, jumps, wall/spike/spring collisions, level bounds, draft migration, public shared persistence, retry/cooldown/daily limits, pagination, private publisher metadata and owner-only deletion.');
