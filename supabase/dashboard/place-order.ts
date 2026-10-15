// Generated dashboard copy. Paste the entire file into Supabase index.ts.
// Regenerate with: npm run prepare:dashboard
const prices={1:490,2:900,3:1250};
const statuses=['new','confirmed','dispatched','delivered','cancelled'];
function validateOrder(input){
 const trim=(key,max)=>typeof input[key]==='string'?input[key].trim().slice(0,max):'';
 const order={name:trim('name',100),phone:trim('phone',30),email:trim('email',254),address:trim('address',700),quantity:Number(input.quantity),request_key:trim('requestKey',36)};
 if(input.website||order.name.length<2||!/^[+\d ()-]{7,30}$/.test(order.phone)||order.address.length<10||!prices[order.quantity]||(order.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email))||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(order.request_key))throw new Error('Check your name, phone, address, email, and selected package.');
 return {...order,total:prices[order.quantity]};
}
function sameOrder(a,b){return ['name','phone','email','address','quantity','total'].every(key=>a[key]===b[key]);}
async function notifyOrder(order,{store,fetcher=fetch,env}){
 if(!await store.claim(order.id))return;
 const text=`New Vendrahub order: ${order.id}\nName: ${order.name}\nPhone: ${order.phone}\nEmail: ${order.email||'Not supplied'}\nAddress: ${order.address}\nPackage: ${order.quantity} scrubber(s)\nTotal: GH₵ ${order.total}\nDelivery: Free\n\nTrack this order in the Vendrahub admin page.`;
 try{
  const response=await fetcher('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'order-'+order.id},body:JSON.stringify({from:'Vendrahub <'+env.EMAIL_FROM+'>',to:[env.ORDER_EMAIL||'contact@vendrahub.com'],subject:`New order ${order.id} — ${order.quantity} scrubber(s)`,text,...(order.email?{reply_to:order.email}:{})})});
  if(!response.ok)throw new Error('Notification rejected');
  const data=await response.json();await store.patch(order.id,{email_status:'sent',email_id:data.id||null});
 }catch{await store.patch(order.id,{email_status:'failed'});}
}


const env=Object.fromEntries(['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','RESEND_API_KEY','EMAIL_FROM','ORDER_EMAIL','ALLOWED_ORIGINS','RATE_LIMIT_SALT'].map(key=>[key,Deno.env.get(key)||'']));
const configured=()=>Boolean(env.RESEND_API_KEY&&env.EMAIL_FROM&&env.RATE_LIMIT_SALT);
function cors(req:Request){
 const origin=req.headers.get('origin')||'';
 const allowed=(env.ALLOWED_ORIGINS||'https://vendrahub.com,https://www.vendrahub.com,https://vendra-rose.vercel.app').split(',').map(s=>s.trim()).filter(Boolean);
 return allowed.includes(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'GET, POST, PATCH, OPTIONS'}:null;
}
function json(req:Request,code:number,data:unknown){return new Response(JSON.stringify(data),{status:code,headers:{...cors(req),'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
async function readBody(req:Request){
 if(!req.headers.get('content-type')?.startsWith('application/json'))throw new Error('JSON required');
 const reader=req.body?.getReader();if(!reader)throw new Error('Body required');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw new Error('Request too large');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 return JSON.parse(new TextDecoder().decode(bytes));
}
async function rest(path:string,method='GET',body?:unknown,prefer?:string){
 const response=await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`,{method,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('Database request failed');const text=await response.text();return text?JSON.parse(text):null;
}
const store={claim:async(id:string)=>await rest('rpc/claim_order_email','POST',{p_id:id}),patch:async(id:string,fields:unknown)=>await rest(`orders?id=eq.${encodeURIComponent(id)}`,'PATCH',fields)};


Deno.serve(async(req:Request)=>{
 if(!cors(req))return json(req,403,{error:'This request origin is not allowed.'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)!});
 if(req.method!=='POST')return json(req,405,{error:'Method not allowed.'});
 if(!configured())return json(req,503,{error:'Online ordering is not available yet. Please try again later.'});
 try{
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.RATE_LIMIT_SALT+ip));
  const key=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
  if(!await rest('rpc/consume_order_limit','POST',{p_key:key}))return json(req,429,{error:'Please wait before submitting another order.'});
  let order;try{order=validateOrder(await readBody(req));}catch{return json(req,400,{error:'Check your name, phone, address, email, and selected package.'});}
  const saved=await rest('orders?on_conflict=request_key','POST',order,'resolution=ignore-duplicates,return=representation');
  const row=saved[0]||(await rest(`orders?request_key=eq.${order.request_key}&select=*`))[0];
  if(!row||!sameOrder(row,order))return json(req,409,{error:'Your order details changed. Reload the page and submit again.'});
  if(saved.length)await notifyOrder(row,{store,env});
  return json(req,201,{id:row.id,total:row.total,message:'Your order has been received. Vendrahub will contact you to confirm delivery and payment arrangements.'});
 }catch{return json(req,500,{error:'Unable to process your order. Please try again.'});}
});
