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
 try{
  const authorization=req.headers.get('authorization')||'';
  if(!authorization.startsWith('Bearer '))return json(req,401,{error:'Please sign in.'});
  const auth=await fetch(`${env.SUPABASE_URL}/auth/v1/user`,{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:authorization},signal:AbortSignal.timeout(10000)});
  if(!auth.ok)return json(req,401,{error:'Please sign in again.'});
  const user=await auth.json();const admins=await rest(`order_admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`);
  if(!admins.length)return json(req,403,{error:'This account does not have admin access.'});
  if(req.method==='GET')return json(req,200,{orders:await rest('orders?select=id,created_at,name,phone,email,address,quantity,total,status,email_status&order=created_at.desc&limit=1000')});
  let input;try{input=await readBody(req);}catch{return json(req,400,{error:'Invalid request.'});}
  if(!/^[a-f0-9-]{36}$/i.test(input.id||''))return json(req,400,{error:'Invalid order reference.'});
  const row=(await rest(`orders?id=eq.${encodeURIComponent(input.id)}&select=*`))[0];if(!row)return json(req,404,{error:'Order not found.'});
  if(req.method==='PATCH'){
   if(!statuses.includes(input.status))return json(req,400,{error:'Invalid order status.'});
   await store.patch(row.id,{status:input.status});return json(req,200,{ok:true});
  }
  if(req.method==='POST'&&input.action==='retry-email'){
   if(!configured())return json(req,503,{error:'Configure Resend first.'});
   if(row.email_status==='sent')return json(req,409,{error:'This notification was already accepted by Resend.'});
   await notifyOrder(row,{store,env});const updated=(await rest(`orders?id=eq.${row.id}&select=email_status`))[0];
   return json(req,updated.email_status==='sent'?200:502,{email_status:updated.email_status,...(updated.email_status==='sent'?{}:{error:'Notification could not be sent. The order remains saved.'})});
  }
  return json(req,405,{error:'Method not allowed.'});
 }catch{return json(req,500,{error:'Unable to process this request. Please try again.'});}
});
