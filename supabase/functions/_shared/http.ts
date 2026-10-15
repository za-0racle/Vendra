export const env=Object.fromEntries(['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','RESEND_API_KEY','EMAIL_FROM','ORDER_EMAIL','ALLOWED_ORIGINS','RATE_LIMIT_SALT'].map(key=>[key,Deno.env.get(key)||'']));
export const configured=()=>Boolean(env.RESEND_API_KEY&&env.EMAIL_FROM&&env.RATE_LIMIT_SALT);
export function cors(req:Request){
 const origin=req.headers.get('origin')||'';
 const allowed=(env.ALLOWED_ORIGINS||'https://vendrahub.com,https://www.vendrahub.com,https://vendra-rose.vercel.app').split(',').map(s=>s.trim()).filter(Boolean);
 return allowed.includes(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'GET, POST, PATCH, OPTIONS'}:null;
}
export function json(req:Request,code:number,data:unknown){return new Response(JSON.stringify(data),{status:code,headers:{...cors(req),'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export async function readBody(req:Request){
 if(!req.headers.get('content-type')?.startsWith('application/json'))throw new Error('JSON required');
 const reader=req.body?.getReader();if(!reader)throw new Error('Body required');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw new Error('Request too large');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 return JSON.parse(new TextDecoder().decode(bytes));
}
export async function rest(path:string,method='GET',body?:unknown,prefer?:string){
 const response=await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`,{method,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('Database request failed');const text=await response.text();return text?JSON.parse(text):null;
}
export const store={claim:async(id:string)=>await rest('rpc/claim_order_email','POST',{p_id:id}),patch:async(id:string,fields:unknown)=>await rest(`orders?id=eq.${encodeURIComponent(id)}`,'PATCH',fields)};
