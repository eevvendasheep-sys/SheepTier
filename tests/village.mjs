import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const moduleURL=s=>'data:text/javascript;base64,'+Buffer.from(compile(s)).toString('base64');
const url=moduleURL(await readFile('lib/village.ts','utf8'));
const {defaultVillage,validateVillage,canWalk}=await import(url);
const world=defaultVillage();validateVillage(world);assert.equal(world.npcs.length,6);assert.ok(world.npcs.every(n=>canWalk(world,n.x,n.y)));assert.equal(canWalk(world,-1,5),false);assert.equal(canWalk(world,11,6),false);assert.equal(canWalk(world,31,22),true);
// Flood-fill the traversable map: every resident must be approachable from spawn.
const visited=new Set(),queue=[[Math.floor(world.spawn.x),Math.floor(world.spawn.y)]];while(queue.length){const [x,y]=queue.shift(),key=x+','+y;if(visited.has(key)||!canWalk(world,x+.5,y+.5))continue;visited.add(key);for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]])queue.push([x+dx,y+dy]);}
for(const n of world.npcs)assert.ok([...visited].some(k=>{const [x,y]=k.split(',').map(Number);return Math.hypot(x+.5-n.x,y+.5-n.y)<2.6;}),n.name+' unreachable');
assert.throws(()=>validateVillage({...world,npcs:[{...world.npcs[0],skin:'https://attacker.test/a'}]}),/Skin/);
assert.throws(()=>validateVillage({...world,spawn:{x:11,y:6}}),/passage/);
assert.throws(()=>validateVillage({...world,objects:[{...world.objects[0],x:90}]}));
assert.throws(()=>validateVillage({...world,npcs:Array(61).fill(world.npcs[0])}));
assert.throws(()=>validateVillage({...world,npcs:[{...world.npcs[0],dialogues:[]}]}));
const a=defaultVillage();a.npcs[0].dialogues=['X'.repeat(401)];assert.throws(()=>validateVillage(a));
const origin='https://sheeptier-580e077a.netlify.app';let doc={admin_player_id:'private-owner',players:[{private:'secret'}]},user=null;
globalThis.villageMock={getChatGPTUser:async()=>user,ownerId:async()=> 'owner',readDocument:async()=>({document:structuredClone(doc)}),changeDocument:async fn=>{const copy=structuredClone(doc),result=fn(copy);doc=copy;return result;}};
let route=await readFile('app/api/village/route.ts','utf8');route=route.replace("import {getChatGPTUser} from '@/app/chatgpt-auth';",'const {getChatGPTUser}=globalThis.villageMock;').replace("import {readDocument,changeDocument,ownerId} from '@/lib/store';",'const {readDocument,changeDocument,ownerId}=globalThis.villageMock;').replace("'@/lib/village'",JSON.stringify(url)).replace("import {isSameSiteRequest} from '@/lib/request-origin';",'const isSameSiteRequest=r=>r.headers.get("origin")==='+JSON.stringify(origin)+';').replace("import {readInput,AccountError} from '@/lib/player-account';",'class AccountError extends Error{constructor(message,status=400){super(message);this.status=status;}}const readInput=async r=>r.json();');
const api=await import(moduleURL(route));
const put=(revision=0,w=world,source=origin)=>api.PUT(new Request(origin+'/api/village',{method:'PUT',headers:{Origin:source,'Content-Type':'application/json'},body:JSON.stringify({revision,world:w})}));
let get=await (await api.GET()).json();assert.deepEqual(Object.keys(get).sort(),['revision','world']);assert.equal(get.revision,0);
assert.equal((await put()).status,401);user={userId:'visitor'};assert.equal((await put()).status,403);user={userId:'owner'};assert.equal((await put(0,world,'https://evil.test')).status,403);assert.equal((await put(0,{...world,spawn:{x:11,y:6}})).status,400);
assert.equal((await put()).status,200);assert.equal(doc.village_revision,1);assert.equal(doc.admin_player_id,'private-owner');assert.equal((await put()).status,409);assert.equal(doc.village_revision,1);assert.equal((await put(1)).status,200);assert.deepEqual((await (await api.GET()).json()).world,world);
console.log('Village: map reachability, collisions, validation, owner access, public data isolation and revision conflicts passed.');
