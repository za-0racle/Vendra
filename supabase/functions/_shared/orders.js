export const prices={1:490,2:900,3:1250};
export const statuses=['new','confirmed','dispatched','delivered','cancelled'];
export function validateOrder(input){
 const trim=(key,max)=>typeof input[key]==='string'?input[key].trim().slice(0,max):'';
 const order={name:trim('name',100),phone:trim('phone',30),email:trim('email',254),address:trim('address',700),quantity:Number(input.quantity),request_key:trim('requestKey',36)};
 if(input.website||order.name.length<2||!/^[+\d ()-]{7,30}$/.test(order.phone)||order.address.length<10||!prices[order.quantity]||(order.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email))||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(order.request_key))throw new Error('Check your name, phone, address, email, and selected package.');
 return {...order,total:prices[order.quantity]};
}
export function sameOrder(a,b){return ['name','phone','email','address','quantity','total'].every(key=>a[key]===b[key]);}
export async function notifyOrder(order,{store,fetcher=fetch,env}){
 if(!await store.claim(order.id))return;
 const text=`New Vendrahub order: ${order.id}\nName: ${order.name}\nPhone: ${order.phone}\nEmail: ${order.email||'Not supplied'}\nAddress: ${order.address}\nPackage: ${order.quantity} scrubber(s)\nTotal: GH₵ ${order.total}\nDelivery: Free\n\nTrack this order in the Vendrahub admin page.`;
 try{
  const response=await fetcher('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'order-'+order.id},body:JSON.stringify({from:'Vendrahub <'+env.EMAIL_FROM+'>',to:[env.ORDER_EMAIL||'contact@vendrahub.com'],subject:`New order ${order.id} — ${order.quantity} scrubber(s)`,text,...(order.email?{reply_to:order.email}:{})})});
  if(!response.ok)throw new Error('Notification rejected');
  const data=await response.json();await store.patch(order.id,{email_status:'sent',email_id:data.id||null});
 }catch{await store.patch(order.id,{email_status:'failed'});}
}
