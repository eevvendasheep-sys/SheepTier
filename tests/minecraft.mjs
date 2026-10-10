import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const dir = path.resolve('.sites-runtime/minecraft-verification');
await fs.mkdir(dir,{recursive:true});
for (const name of ['minecraft','minecraft-resolver']) {
  const source = (await fs.readFile(`lib/${name}.ts`,'utf8')).replace('from "./minecraft"','from "./minecraft.mjs"');
  await fs.writeFile(path.join(dir,name+'.mjs'),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
}
const { parseMinecraftInput } = await import(path.join(dir,'minecraft.mjs'));
const { resolveMinecraftProfile, MinecraftLookupError } = await import(path.join(dir,'minecraft-resolver.mjs'));
assert.deepEqual(parseMinecraftInput('https://fr.namemc.com/profile/Eevven_.1'),{kind:'username',value:'Eevven_'});
assert.deepEqual(parseMinecraftInput('https://namemc.com/profile/Notch.3?tab=names'),{kind:'username',value:'Notch'});
assert.throws(()=>parseMinecraftInput('Notch.1'));
assert.throws(()=>parseMinecraftInput('https://namemc.com.evil.example/profile/Notch.1'));
const profile = {id:'069a79f444e94726a5befca90e38aaf5',name:'Notch'};
const mock = responses => {
  const calls=[];
  return {calls,fetcher:async(url,options)=>{
    calls.push(url); assert.ok(options.signal); assert.equal(options.redirect,'manual');
    assert.ok(['api.minecraftservices.com','api.mojang.com','sessionserver.mojang.com','crafthead.net'].includes(new URL(url).hostname));
    const next=responses.shift(); if(next instanceof Error) throw next;
    assert.ok(next,'Unexpected upstream request'); return next;
  }};
};
let fixture=mock([new Response('Forbidden',{status:403}),Response.json(profile)]);
assert.equal((await resolveMinecraftProfile('https://fr.namemc.com/profile/Notch.1',fixture.fetcher)).uuid,profile.id);
assert.equal(fixture.calls.length,2);
fixture=mock([new Response('<html>down</html>',{status:200}),new Response('',{status:503}),Response.json(profile)]);
assert.equal((await resolveMinecraftProfile('Notch',fixture.fetcher)).username,'Notch');
assert.ok(fixture.calls[2].startsWith('https://crafthead.net/profile/'));
fixture=mock([new Response(null,{status:302,headers:{Location:'https://evil.example/profile'}}),Response.json(profile)]);
assert.equal((await resolveMinecraftProfile('Notch',fixture.fetcher)).uuid,profile.id);
assert.equal(fixture.calls.length,2);
fixture=mock([new Error('Network failure'),new Response('',{status:429}),Response.json(profile)]);
assert.equal((await resolveMinecraftProfile('Notch',fixture.fetcher)).uuid,profile.id);
fixture=mock([Response.json({...profile,id:'853c80ef3c3749fdaa49938b674adae6'}),Response.json(profile)]);
assert.equal((await resolveMinecraftProfile(profile.id,fixture.fetcher)).uuid,profile.id);
fixture=mock([Response.json({...profile,name:'WrongPlayer'}),Response.json(profile)]);
assert.equal((await resolveMinecraftProfile('Notch',fixture.fetcher)).username,'Notch');
fixture=mock([new Response(null,{status:204}),new Response('',{status:404}),new Response('',{status:404})]);
await assert.rejects(()=>resolveMinecraftProfile('Notch',fixture.fetcher),e=>e instanceof MinecraftLookupError&&e.status===404);
fixture=mock([new Response('',{status:429}),new Response('',{status:429}),new Response('',{status:429})]);
await assert.rejects(()=>resolveMinecraftProfile('Notch',fixture.fetcher),e=>e.status===429);
fixture=mock([new Response('',{status:403}),new Response('',{status:503}),new Error('Network failure')]);
await assert.rejects(()=>resolveMinecraftProfile('Notch',fixture.fetcher),e=>e.status===502&&e.diagnostics.length===3);
fixture=mock([Response.json({...profile,properties:[{name:'textures',value:'not base64'}]})]);
assert.equal((await resolveMinecraftProfile('Notch',fixture.fetcher)).skinUrl,null);
console.log('Verified: NameMC username history links, fixed provider origins, 403/network/invalid-JSON fallbacks, profile matching, and accurate 404/429/502 errors.');
if(process.argv.includes('--live')) {
  const live=await resolveMinecraftProfile('https://fr.namemc.com/profile/Eevven_.1');
  assert.equal(live.username,'Eevven_'); assert.equal(live.uuid,'e8385aa6ba804aa39746bc7e9ce52579');
  const byUuid=await resolveMinecraftProfile('e8385aa6-ba80-4aa3-9746-bc7e9ce52579');
  assert.equal(byUuid.uuid,live.uuid);
  console.log('Live external lookup verified for the reported NameMC format and UUID.');
}
