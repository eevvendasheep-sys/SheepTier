import {Pool,types,type PoolClient} from 'pg';
import {createClient} from '@supabase/supabase-js';
import {translateSQL} from './postgres-sql';
// Millisecond timestamps remain safe JS integers; never parse arbitrary bigint amounts.
types.setTypeParser(20,value=>{const n=Number(value);if(!Number.isSafeInteger(n))throw Error('Integer out of range');return n;});
let pool:Pool|undefined;
function database(){if(!process.env.SUPABASE_DB_URL)throw Error('Database not configured');const url=new URL(process.env.SUPABASE_DB_URL);for(const key of ['sslmode','sslcert','sslkey','sslrootcert'])url.searchParams.delete(key);return pool??=new Pool({connectionString:url.toString(),max:2,idleTimeoutMillis:10000,connectionTimeoutMillis:15000,ssl:{rejectUnauthorized:true,...(process.env.SUPABASE_DB_CA_B64?{ca:Buffer.from(process.env.SUPABASE_DB_CA_B64,'base64').toString('utf8')}:{})}});}
async function transaction<T>(fn:(client:PoolClient)=>Promise<T>):Promise<T>{for(let attempt=0;attempt<5;attempt++){const client=await database().connect();try{await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');const result=await fn(client);await client.query('COMMIT');return result;}catch(e){await client.query('ROLLBACK');if((e as {code?:string}).code!=='40001'||attempt===4)throw e;}finally{client.release();}}throw Error('Database contention');}
class Statement{
 constructor(readonly sql:string,readonly values:unknown[]=[]){ }
 bind(...values:unknown[]){return new Statement(this.sql,values);}
 async execute(client?:PoolClient){const text=translateSQL(this.sql);return client?client.query(text,this.values):transaction(c=>c.query(text,this.values));}
 async first<T=Record<string,unknown>>(){return (await this.execute()).rows[0] as T|undefined??null;}
 async all<T=Record<string,unknown>>(){return {results:(await this.execute()).rows as T[]};}
 async run(){const result=await this.execute();return {meta:{changes:result.rowCount??0}};}
}
export function storage(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_KEY;if(!url||!key)throw Error('Storage not configured');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}).storage.from('sheeptier-media');}
const bucket={
 async put(path:string,body:Uint8Array|ReadableStream,options?:{httpMetadata?:{contentType:string}}){const bytes=body instanceof Uint8Array?body:new Uint8Array(await new Response(body).arrayBuffer());const {error}=await storage().upload(path,bytes,{contentType:options?.httpMetadata?.contentType,upsert:true});if(error)throw Error('Storage upload failed');},
 async get(path:string){const {data,error}=await storage().download(path);if(error||!data)return null;return {body:new Uint8Array(await data.arrayBuffer()),httpMetadata:{contentType:data.type},size:data.size};},
 async delete(path:string){const {error}=await storage().remove([path]);if(error)throw Error('Storage deletion failed');}
};
export const env={DB:{prepare(sql:string){return new Statement(sql);},async batch(statements:Statement[]){return transaction(async c=>{const result=[];for(const statement of statements)result.push(await statement.execute(c));return result;});}},BUCKET:bucket,
 get ADMIN_USERNAME(){return process.env.ADMIN_USERNAME;},get ADMIN_PASSWORD_HASH(){return process.env.ADMIN_PASSWORD_HASH;},get ADMIN_SESSION_SECRET(){return process.env.ADMIN_SESSION_SECRET;}};
