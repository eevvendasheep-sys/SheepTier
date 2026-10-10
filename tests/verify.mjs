import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const dir = path.resolve('.sites-runtime/verification');
await fs.mkdir(dir, { recursive: true });
for (const name of ['model', 'minecraft', 'demo']) {
  const source = await fs.readFile(`lib/${name}.ts`, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
  await fs.writeFile(path.join(dir, name + '.mjs'), compiled.outputText);
}
const { applyOperation, APIError } = await import(path.join(dir, 'model.mjs'));
const { parseMinecraftInput } = await import(path.join(dir, 'minecraft.mjs'));
const { demoSettings, demoModes, demoTiers } = await import(path.join(dir, 'demo.mjs'));
const doc = { site_settings: [demoSettings], gamemodes: structuredClone(demoModes), tiers: structuredClone(demoTiers), players: [], rankings: [], users: [
  { id:'owner',role:'admin',email:'owner@test.example' }, {id:'reader',role:'viewer'}, {id:'editor',role:'editor'}
] };
const op = (query, user='owner') => applyOperation(doc, query, user, 'owner');
const denied = (query, user, status) => assert.throws(()=>applyOperation(doc,query,user,'owner'), e=>e instanceof APIError && e.status === status);
denied({table:'players',operation:'insert',payload:{}}, undefined, 401);
denied({table:'players',operation:'insert',payload:{}}, 'reader', 403);
denied({table:'players',operation:'insert',payload:{}}, 'editor', 403);
doc.users.push({id:'other-admin',role:'admin'});
denied({table:'players',operation:'insert',payload:{}}, 'other-admin', 403);
denied({table:'admin_users_view',operation:'select'}, 'other-admin', 403);
denied({table:'user_roles',operation:'upsert',payload:{user_id:'reader',role:'admin'}}, 'editor', 403);
denied({table:'admin_users_view',operation:'select'}, 'reader', 403);
assert.throws(()=>op({table:'user_roles',operation:'upsert',payload:{user_id:'owner',role:'viewer'}}), /propriétaire/);
assert.throws(()=>op({table:'user_roles',operation:'upsert',payload:{user_id:'reader',role:'admin'}}), /propriétaire/);
assert.equal(op({table:'user_roles',operation:'select'},'editor')[0].role,'viewer');
const publicSettings = applyOperation(doc,{table:'site_settings',operation:'select',one:true}, undefined, 'owner');
assert.equal(publicSettings.site_name, 'SheepTier');
assert.equal(op({table:'user_roles',operation:'select'},'reader').length,1);
const player = op({table:'players',operation:'insert',one:true,payload:{minecraft_uuid:'069a79f444e94726a5befca90e38aaf5',username:'Notch',region:'EU'}});
assert.throws(()=>op({table:'players',operation:'insert',payload:{minecraft_uuid:player.minecraft_uuid,username:'Notch'}}), /déjà/);
const ranking = op({table:'rankings',operation:'upsert',one:true,payload:{player_id:player.id,gamemode_id:'sword',tier_id:'ht1',points:999999}});
assert.equal(ranking.points,60);
op({table:'tiers',operation:'update',filters:{id:'ht1'},payload:{points:70}});
assert.equal(doc.rankings[0].points,70);
assert.throws(()=>op({table:'site_settings',operation:'upsert',payload:{...demoSettings,discord_url:'javascript:alert(1)'}}), /HTTP/);
op({table:'players',operation:'delete',filters:{id:player.id}});
assert.equal(doc.players.length,0); assert.equal(doc.rankings.length,0);
assert.deepEqual(parseMinecraftInput('https://namemc.com/profile/Notch'),{kind:'username',value:'Notch'});
assert.deepEqual(parseMinecraftInput('https://fr.namemc.com/profile/069a79f4-44e9-4726-a5be-fca90e38aaf5.1'),{kind:'uuid',value:'069a79f444e94726a5befca90e38aaf5'});
assert.throws(()=>parseMinecraftInput('https://evilnamemc.com/profile/Notch'),/NameMC/);
assert.throws(()=>parseMinecraftInput('https://namemc.com/skin/abc'),/profil/);
console.log('Verified: role boundaries, owner protection, duplicate players, authoritative points, cascaded deletes, safe URLs, and NameMC parsing.');

// Exercise the actual persistence code against SQLite with a minimal D1 adapter.
const { DatabaseSync } = await import('node:sqlite');
const sql = new DatabaseSync(':memory:');
const migration = await fs.readFile('drizzle/0000_narrow_white_tiger.sql','utf8');
sql.exec(migration.replaceAll('--> statement-breakpoint', ''));
globalThis.testD1Env = { DB: { prepare(query) {
  const statement = sql.prepare(query); let values = [];
  return { bind(...args) { values = args; return this; },
    async run() { const info = statement.run(...values); return { meta: { changes: Number(info.changes) } }; },
    async first() { return statement.get(...values) || null; } };
} } };
let storeSource = await fs.readFile('lib/store.ts', 'utf8');
storeSource = storeSource.replace('import { env } from "cloudflare:workers";', 'const env = globalThis.testD1Env;').replace('from "./demo"', 'from "./demo.mjs"');
await fs.writeFile(path.join(dir,'store.mjs'),ts.transpileModule(storeSource,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
const { readDocument, changeDocument, registerUser, ownerId } = await import(path.join(dir,'store.mjs'));
await assert.rejects(()=>registerUser({userId:'attacker',email:'attacker@test.example',displayName:'Attacker'}), /propriétaire/);
assert.equal(await ownerId(),null);
sql.prepare('INSERT INTO site_owner (id,user_id) VALUES (1,?)').run('owner');
await registerUser({userId:'owner',email:'owner@test.example',displayName:'Owner'});
await registerUser({userId:'outsider',email:'viewer@test.example',displayName:'Viewer'});
assert.equal(await ownerId(),'owner');
assert.equal((await readDocument()).document.users.find(u=>u.id==='outsider').role,'viewer');
await Promise.all([
  changeDocument(document=>document.site_settings[0].site_name='Custom SheepTier'),
  changeDocument(document=>document.site_settings[0].tagline='A saved community ranking'),
]);
const saved = (await readDocument()).document.site_settings[0];
assert.equal(saved.site_name,'Custom SheepTier'); assert.equal(saved.tagline,'A saved community ranking');
console.log('Verified: durable saves, immutable owner identity, viewer registration, and concurrent update retries.');
sql.close();
