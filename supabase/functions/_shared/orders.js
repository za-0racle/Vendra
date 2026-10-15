import {ghanaLocations} from './ghana.js';
export const prices={1:490,2:900,3:1250};
export const statuses=['new','confirmed','dispatched','delivered','cancelled'];
export const statusLabels={new:'Order received',confirmed:'Order confirmed',dispatched:'Dispatched',delivered:'Delivered',cancelled:'Cancelled'};
const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const reference=order=>order.order_number||order.id;
export function trackingUrl(order,env){return `${(env.SITE_URL||'https://vendrahub.com').replace(/\/$/,'')}/track.html#token=${order.tracking_token}`;}
export function validateOrder(input){
 const trim=(key,max)=>typeof input[key]==='string'?input[key].trim().slice(0,max):'';
 const region=trim('region',60),city=trim('city',100),street=trim('street',300),landmark=trim('landmark',200),digital_address=trim('digital_address',40);
 const structured=Boolean(region||city||street);
 if(structured&&(!Object.hasOwn(ghanaLocations,region)||city.length<2||street.length<5))throw new Error('Choose your region, town or city, and enter your street address.');
 const address=structured?[street,landmark,city,region,digital_address].filter(Boolean).join(', '):trim('address',700);
 const order={name:trim('name',100),phone:trim('phone',30),email:trim('email',254),address,quantity:Number(input.quantity),request_key:trim('requestKey',36),region,city,street,landmark,digital_address};
 if(input.website||order.name.length<2||!/^[+\d ()-]{7,30}$/.test(order.phone)||order.address.length<10||!prices[order.quantity]||(order.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email))||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(order.request_key))throw new Error('Check your name, phone, address, email, and selected package.');
 return {...order,total:prices[order.quantity]};
}
export function sameOrder(a,b){return ['name','phone','email','address','quantity','total'].every(key=>a[key]===b[key]);}
async function sendResend(payload,key,{fetcher=fetch,env}){
 const response=await fetcher('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({from:'Vendrahub <'+env.EMAIL_FROM+'>',...payload})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok){const code=String(data.name||'email_service_error').replace(/[^a-z0-9_-]/gi,'').slice(0,60);throw new Error(`Resend HTTP ${response.status}: ${code}`);}
 return data.id||null;
}
export async function notifyOrder(order,{store,fetcher=fetch,env}){
 if(!await store.claim(order.id))return;
 const text=`New Vendrahub order: ${reference(order)}\nName: ${order.name}\nPhone: ${order.phone}\nEmail: ${order.email||'Not supplied'}\nAddress: ${order.address}\nPackage: ${order.quantity} scrubber(s)\nTotal: GH₵ ${order.total}\nDelivery: Free\n\nTrack this order in the Vendrahub admin page.`;
 try{
  const id=await sendResend({to:[env.ORDER_EMAIL||'contact@vendrahub.com'],subject:`New order ${reference(order)} — ${order.quantity} scrubber(s)`,text,...(order.email?{reply_to:order.email}:{})},'order-'+order.id,{fetcher,env});
  await store.patch(order.id,{email_status:'sent',email_id:id,email_error:null});
 }catch(error){await store.patch(order.id,{email_status:'failed',email_error:error.message?.startsWith('Resend HTTP')?error.message:'Email service connection failed.'});}
}
export async function notifyCustomer(order,event,{store,fetcher=fetch,env}){
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
