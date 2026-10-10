import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdtemp,rm,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {randomBytes} from 'node:crypto';
import {createInterface} from 'node:readline/promises';
import bcrypt from 'bcryptjs';
import {Pool} from 'pg';
import {createClient} from '@supabase/supabase-js';
import {databaseFailure} from './lib/installation-errors.mjs';
const root=fileURLToPath(new URL('./',import.meta.url));process.chdir(root);
const cli=join(root,'node_modules','netlify-cli','bin','run.js');
process.env.NEXT_TELEMETRY_DISABLED='1';
function run(args,{silent=false}={}){return new Promise((resolve,reject)=>{const p=spawn(process.execPath,[cli,...args],{stdio:silent?['ignore','pipe','pipe']:'inherit',env:process.env});if(silent){p.stdout.resume();p.stderr.resume();}p.on('error',()=>reject(Error('Impossible de lancer Netlify CLI.')));p.on('close',c=>c===0?resolve():reject(Error('Netlify : échec de '+args[0]+'. Vérifie les accès à ton compte.')));});}
async function ask(message){const r=createInterface({input:process.stdin,output:process.stdout});try{return (await r.question(message)).trim();}finally{r.close();}}
function secret(message){if(!process.stdin.isTTY)throw Error('Lance Installer-Windows.bat dans une fenêtre de terminal.');process.stdout.write(message);return new Promise((resolve,reject)=>{let value='';process.stdin.setRawMode(true);process.stdin.resume();function done(){process.stdin.off('data',receive);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');}function receive(bytes){for(const c of bytes.toString('utf8')){if(c==='\u0003'){done();reject(Error('Annulé.'));return;}if(c==='\r'||c==='\n'){done();resolve(value);return;}if(c==='\u007f'||c==='\b')value=value.slice(0,-1);else if(c>=' ')value+=c;}}process.stdin.on('data',receive);});}
async function main(){
 console.log('SheepTier — Netlify + Supabase. Le site actuel ne sera pas modifié.');
 console.log('Prépare un projet Supabase neuf, son URL, sa clé secrète Storage et son URI PostgreSQL Transaction pooler. Ne partage aucune clé dans le chat.');
 await run(['login']);
 let setup;try{setup=JSON.parse(await readFile('installation-netlify.json','utf8'));}catch{setup={name:'sheeptier-'+randomBytes(4).toString('hex')};}
 if(await ask('Tape INSTALLER pour configurer le projet et publier sur Netlify : ')!=='INSTALLER')throw Error('Annulé.');
 let linked=false;try{await access('.netlify/state.json');linked=true;}catch{}
 if(!linked){await writeFile('installation-netlify.json',JSON.stringify(setup,null,2));await run(['sites:create','--name',setup.name]);}
 const url=await ask('URL du projet Supabase (https://...supabase.co) : ');
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url))throw Error('URL Supabase invalide.');
 const storageKey=await secret('Clé secrète Supabase (sb_secret_... ou service_role, masquée) : ');
 if(!storageKey.startsWith('sb_secret_')&&!storageKey.startsWith('eyJ'))throw Error('Clé secrète invalide.');
 const dbURL=await secret('URI PostgreSQL complète Transaction pooler, mot de passe remplacé (masquée) : ');
 let db;try{db=new URL(dbURL);}catch{throw Error('URI de base invalide.');}
 if(!['postgresql:','postgres:'].includes(db.protocol)||!db.hostname.endsWith('.pooler.supabase.com')||!db.password||dbURL.includes('[YOUR-PASSWORD]'))throw Error('Utilise une URI Transaction pooler Supabase avec ton vrai mot de passe encodé dans l’URI.');
 if(setup.supabaseURL&&setup.supabaseURL!==url)throw Error('Ce dossier est lié à un autre projet Supabase. Utilise une nouvelle copie pour changer de projet.');
 const secureURL=new URL(dbURL);for(const key of ['sslmode','sslcert','sslkey','sslrootcert'])secureURL.searchParams.delete(key);
 let ca='';try{ca=await readFile('supabase-ca.crt','utf8');}catch(e){if(e.code!=='ENOENT')throw Error('Impossible de lire supabase-ca.crt.');}
 if(ca&&!ca.includes('-----BEGIN CERTIFICATE-----'))throw Error('Le fichier supabase-ca.crt ne contient pas de certificat PEM valide.');
 const pool=new Pool({connectionString:secureURL.toString(),ssl:{rejectUnauthorized:true,...(ca?{ca}:{})},max:1,connectionTimeoutMillis:15000});
 let phase='connexion';try{await pool.query('SELECT 1');console.log('Connexion PostgreSQL réussie.');phase='initialisation des tables';await pool.query(await readFile('supabase-schema.sql','utf8'));}catch(e){throw Error(databaseFailure(e,phase));}finally{await pool.end();}
 const sb=createClient(url,storageKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:buckets,error:listError}=await sb.storage.listBuckets();if(listError)throw Error('La clé Supabase ne permet pas de gérer Storage. Utilise une clé secrète serveur.');
 const bucket=buckets.find(b=>b.id==='sheeptier-media');
 if(bucket?.public)throw Error('Le bucket sheeptier-media doit être PRIVÉ. Désactive Public dans Supabase Storage.');
 const settings={public:false,fileSizeLimit:20*1024*1024,allowedMimeTypes:['video/mp4','video/webm','image/png','image/jpeg','image/gif','image/webp']};
 const {error:bucketError}=bucket?await sb.storage.updateBucket('sheeptier-media',settings):await sb.storage.createBucket('sheeptier-media',settings);
 if(bucketError)throw Error('Création du stockage refusée. Vérifie les droits et les limites du projet Supabase.');
 const username=await ask('Identifiant administrateur (3 à 24 lettres/chiffres/underscores) : ');if(!/^[A-Za-z0-9_]{3,24}$/.test(username))throw Error('Identifiant invalide.');
 const pass=await secret('Mot de passe ADMIN du site (12 caractères minimum, saisie invisible) : ');if(pass.length<12||Buffer.byteLength(pass)>72)throw Error('Mot de passe : minimum 12 caractères et maximum 72 octets.');
 if(await secret('Confirme ce mot de passe : ')!==pass)throw Error('Les mots de passe diffèrent.');
 const variables={SUPABASE_URL:url,SUPABASE_SERVICE_KEY:storageKey,SUPABASE_DB_URL:dbURL,ADMIN_USERNAME:username,ADMIN_PASSWORD_HASH:await bcrypt.hash(pass,12),ADMIN_SESSION_SECRET:randomBytes(32).toString('hex'),SUPABASE_DB_CA_B64:ca?Buffer.from(ca).toString('base64'):''};
 const temp=await mkdtemp(join(tmpdir(),'sheeptier-install-'));
 try{const file=join(temp,'.env');await writeFile(file,Object.entries(variables).map(([k,v])=>k+'='+JSON.stringify(v)).join('\n'),{mode:0o600});await run(['env:import',file],{silent:true});}finally{await rm(temp,{recursive:true,force:true});}
 Object.assign(process.env,variables);setup.supabaseURL=url;await writeFile('installation-netlify.json',JSON.stringify(setup,null,2));
 console.log('Base et stockage prêts. Compilation et publication sur Netlify…');
 await run(['deploy','--prod','--context','production']);
 console.log('Terminé. Le lien public .netlify.app est affiché ci-dessus. Administration : /login.');
}
main().catch(e=>{console.error('Installation interrompue : '+e.message);console.error('Conserve ce dossier et relance après correction. Ne partage aucune clé ni URI de base.');process.exitCode=1;});
