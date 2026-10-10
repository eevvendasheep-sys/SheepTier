import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
async function load(path,replacements){let source=await readFile(path,'utf8');for(const [from,to] of replacements){assert.ok(source.includes(from),from);source=source.replace(from,to);}return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));}
globalThis.ownerDoc={};globalThis.ownerPlayer=null;globalThis.bootstrap=false;
const auth=await load('app/chatgpt-auth.ts',[
 ["import { headers } from 'next/headers';","const headers=async()=>new Headers({cookie:'test'});"],
 ["import { redirect } from 'next/navigation';","const redirect=()=>{throw Error('redirect');};"],
 ["import { readDocument } from '@/lib/store';","const readDocument=async()=>({document:globalThis.ownerDoc});"],
 ["import { accountFromRequest } from '@/lib/player-account';","const accountFromRequest=async()=>globalThis.ownerPlayer;"],
 ["import { readAdminSession } from '@/lib/admin-session';","const readAdminSession=async()=>globalThis.bootstrap?{userId:'cloudflare-owner'}:null;"]]);
assert.equal(await auth.getChatGPTUser(),null);globalThis.bootstrap=true;assert.equal((await auth.getChatGPTUser()).userId,'cloudflare-owner');globalThis.ownerDoc.admin_player_id='chosen';assert.equal(await auth.getChatGPTUser(),null);globalThis.ownerPlayer={id:'other',username:'Other'};assert.equal(await auth.getChatGPTUser(),null);globalThis.ownerPlayer={id:'chosen',username:'Owner'};assert.equal((await auth.getChatGPTUser()).displayName,'Owner');globalThis.bootstrap=false;assert.equal((await auth.getChatGPTUser()).userId,'cloudflare-owner');
const blobs=new Map([['logos/mode/first.png',new Uint8Array([1,2])],['logos/mode/second.png',new Uint8Array([3,4])]]);globalThis.logoEnv={BUCKET:{get:async key=>blobs.has(key)?{body:blobs.get(key),httpMetadata:{contentType:'image/png'}}:null}};
const logo=await load('lib/logo-storage.ts',[["import {env} from '@/lib/netlify-env';","const env=globalThis.logoEnv;"]]);const first=await logo.serveLogo('mode/first.png'),second=await logo.serveLogo('mode/second.png');assert.notDeepEqual(new Uint8Array(await first.arrayBuffer()),new Uint8Array(await second.arrayBuffer()));for(const key of ['Cache-Control','CDN-Cache-Control','Netlify-CDN-Cache-Control'])assert.equal(first.headers.get(key),'no-store');assert.equal((await logo.serveLogo('../secret')).status,404);assert.equal((await logo.serveLogo('mode/..')).status,404);
console.log('PASS: only bound player authorized; other players and old admin denied; distinct images; CDN caching disabled; invalid paths rejected.');
