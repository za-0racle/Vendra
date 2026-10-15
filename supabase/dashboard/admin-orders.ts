// Generated dashboard copy. Paste the entire file into Supabase index.ts.
// Regenerate with: npm run prepare:dashboard
// Ghana's 16 regions and their capitals follow https://lgs.gov.gh/regions/.
// Common towns are suggestions; customers can enter another town within their region.
const ghanaLocations={
 'Ahafo':['Goaso'],
 'Ashanti':['Kumasi','Obuasi','Ejisu'],
 'Bono':['Sunyani'],
 'Bono East':['Techiman'],
 'Central':['Cape Coast','Kasoa','Elmina'],
 'Eastern':['Koforidua','Akropong','Nkawkaw'],
 'Greater Accra':['Accra','Tema','Madina','Adenta','Ashaiman'],
 'North East':['Nalerigu'],
 'Northern':['Tamale'],
 'Oti':['Dambai'],
 'Savannah':['Damongo'],
 'Upper East':['Bolgatanga'],
 'Upper West':['Wa'],
 'Volta':['Ho'],
 'Western':['Sekondi','Takoradi','Tarkwa'],
 'Western North':['Sefwi Wiawso']
};


const prices={1:490,2:900,3:1250};
const statuses=['new','confirmed','dispatched','delivered','cancelled'];
const statusLabels={new:'Order received',confirmed:'Order confirmed',dispatched:'Dispatched',delivered:'Delivered',cancelled:'Cancelled'};
const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const reference=order=>order.order_number||order.id;
function trackingUrl(order,env){return `${(env.SITE_URL||'https://vendrahub.com').replace(/\/$/,'')}/track.html#token=${order.tracking_token}`;}
function validateOrder(input){
 const trim=(key,max)=>typeof input[key]==='string'?input[key].trim().slice(0,max):'';
 const region=trim('region',60),city=trim('city',100),street=trim('street',300),landmark=trim('landmark',200),digital_address=trim('digital_address',40);
 const structured=Boolean(region||city||street);
 if(structured&&(!Object.hasOwn(ghanaLocations,region)||city.length<2||street.length<5))throw new Error('Choose your region, town or city, and enter your street address.');
 const address=structured?[street,landmark,city,region,digital_address].filter(Boolean).join(', '):trim('address',700);
 const order={name:trim('name',100),phone:trim('phone',30),email:trim('email',254),address,quantity:Number(input.quantity),request_key:trim('requestKey',36),region,city,street,landmark,digital_address};
 if(input.website||order.name.length<2||!/^[+\d ()-]{7,30}$/.test(order.phone)||order.address.length<10||!prices[order.quantity]||(order.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email))||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(order.request_key))throw new Error('Check your name, phone, address, email, and selected package.');
 return {...order,total:prices[order.quantity]};
}
function sameOrder(a,b){return ['name','phone','email','address','quantity','total'].every(key=>a[key]===b[key]);}
async function sendResend(payload,key,{fetcher=fetch,env}){
 const response=await fetcher('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({from:'Vendrahub <'+env.EMAIL_FROM+'>',...payload})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok){const code=String(data.name||'email_service_error').replace(/[^a-z0-9_-]/gi,'').slice(0,60);throw new Error(`Resend HTTP ${response.status}: ${code}`);}
 return data.id||null;
}
async function notifyOrder(order,{store,fetcher=fetch,env}){
 if(!await store.claim(order.id))return;
 const text=`New Vendrahub order: ${reference(order)}\nName: ${order.name}\nPhone: ${order.phone}\nEmail: ${order.email||'Not supplied'}\nAddress: ${order.address}\nPackage: ${order.quantity} scrubber(s)\nTotal: GH₵ ${order.total}\nDelivery: Free\n\nTrack this order in the Vendrahub admin page.`;
 try{
  const id=await sendResend({to:[env.ORDER_EMAIL||'contact@vendrahub.com'],subject:`New order ${reference(order)} — ${order.quantity} scrubber(s)`,text,...(order.email?{reply_to:order.email}:{})},'order-'+order.id,{fetcher,env});
  await store.patch(order.id,{email_status:'sent',email_id:id,email_error:null});
 }catch(error){await store.patch(order.id,{email_status:'failed',email_error:error.message?.startsWith('Resend HTTP')?error.message:'Email service connection failed.'});}
}
async function notifyCustomer(order,event,{store,fetcher=fetch,env}){
 if(!order.email||!order.tracking_token)return;
 if(event.startsWith('status-'))order={...order,status:event.slice(7)};
 if(!await store.claimCustomer(order.id,event))return;
 const title=event==='received'?'Thank you for your order!':statusLabels[order.status];
 const update=event==='received'?'Your order is safely with us. We will contact you to confirm delivery and payment arrangements.':({new:'We have received your order.',confirmed:'Your order has been confirmed. We will contact you about delivery arrangements.',dispatched:'Your order has been marked as dispatched. Our team will coordinate delivery with you.',delivered:'Your order has been marked as delivered. Thank you for shopping with Vendrahub!',cancelled:'Your order has been marked as cancelled. Contact us if you need help.'})[order.status];
 const url=trackingUrl(order,env),ref=reference(order);
 const text=`Hello ${order.name},\n\n${title}\n${update}\n\nOrder: ${ref}\nPackage: ${order.quantity} scrubber(s)\nTotal: GH₵ ${order.total}\nDelivery: Free\n\nTrack your order: ${url}\nKeep this link private.\n\nWith thanks,\nThe Vendrahub team`;
 const html=`<!doctype html><html><body style="margin:0;background:#f7f5ed;font-family:Arial,sans-serif;color:#173e35;padding:32px 16px"><div style="max-width:560px;margin:auto;background:white;border:1px solid #dfe5d8;border-radius:16px;overflow:hidden"><div style="background:#173e35;color:#fff;padding:28px 32px;font-size:27px;font-family:Georgia,serif">Vendrahub</div><div style="padding:32px"><p>Hello ${escapeHtml(order.name)},</p><h1 style="font-family:Georgia,serif;font-size:30px">${escapeHtml(title)}</h1><p style="line-height:1.8">${escapeHtml(update)}</p><div style="background:#f2f4ec;border-radius:9px;padding:20px;margin:24px 0;line-height:1.9"><strong>${escapeHtml(ref)}</strong><br>${order.quantity} scrubber(s)<br>GH₵ ${order.total} · Free delivery</div><a href="${escapeHtml(url)}" style="display:inline-block;background:#173e35;color:white;padding:16px 24px;border-radius:6px;text-decoration:none;font-weight:bold">Track your order</a><p style="font-size:13px;color:#596852;line-height:1.7;margin-top:24px">Keep your tracking link private. It shows the latest order status, not live courier GPS tracking.</p><p style="line-height:1.8">With thanks,<br>The Vendrahub team</p></div></div></body></html>`;
 try{const id=await sendResend({to:[order.email],subject:`${title} · ${ref}`,text,html},`customer-${order.id}-${event}`,{fetcher,env});await store.patchCustomer(order.id,event,{state:'sent',email_id:id,error:null});}
 catch(error){await store.patchCustomer(order.id,event,{state:'failed',error:error.message?.startsWith('Resend HTTP')?error.message:'Email service connection failed.'});}
}


const env=Object.fromEntries(['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','RESEND_API_KEY','EMAIL_FROM','ORDER_EMAIL','ALLOWED_ORIGINS','RATE_LIMIT_SALT','SITE_URL'].map(key=>[key,Deno.env.get(key)||'']));
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
const store={
 claim:async(id:string)=>await rest('rpc/claim_order_email','POST',{p_id:id}),
 patch:async(id:string,fields:unknown)=>await rest(`orders?id=eq.${encodeURIComponent(id)}`,'PATCH',fields),
 claimCustomer:async(id:string,event:string)=>await rest('rpc/claim_customer_notification','POST',{p_order_id:id,p_event:event}),
 patchCustomer:async(id:string,event:string,fields:unknown)=>await rest(`order_customer_notifications?order_id=eq.${encodeURIComponent(id)}&event=eq.${encodeURIComponent(event)}`,'PATCH',fields)
};


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
  if(req.method==='GET')return json(req,200,{orders:await rest('orders?select=id,order_number,created_at,name,phone,email,address,region,city,quantity,total,status,email_status,email_error,order_customer_notifications(event,state,error)&order=created_at.desc&limit=1000')});
  let input;try{input=await readBody(req);}catch{return json(req,400,{error:'Invalid request.'});}
  if(!/^[a-f0-9-]{36}$/i.test(input.id||''))return json(req,400,{error:'Invalid order reference.'});
  const row=(await rest(`orders?id=eq.${encodeURIComponent(input.id)}&select=*`))[0];if(!row)return json(req,404,{error:'Order not found.'});
  if(req.method==='PATCH'){
   if(!statuses.includes(input.status))return json(req,400,{error:'Invalid order status.'});
   await store.patch(row.id,{status:input.status});if(input.status!==row.status)await Promise.allSettled([notifyCustomer({...row,status:input.status},'status-'+input.status,{store,env})]);return json(req,200,{ok:true});
  }
  if(req.method==='POST'&&input.action==='retry-customer-email'){
   if(!row.email)return json(req,400,{error:'This customer did not supply an email address.'});
   if(!configured())return json(req,503,{error:'Configure Resend first.'});
   const event=String(input.event||'received');
   if(!['received',...statuses.map(status=>'status-'+status)].includes(event))return json(req,400,{error:'Invalid notification.'});
   await notifyCustomer(row,event,{store,env});
   const result=(await rest(`order_customer_notifications?order_id=eq.${row.id}&event=eq.${event}&select=state`))[0];
   return json(req,result?.state==='sent'?200:502,{...(result?.state==='sent'?{ok:true}:{error:'Customer email could not be sent. The order remains saved.'})});
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
