import {notifyOrder,notifyCustomer,statuses} from '../_shared/orders.js';
import {env,configured,cors,json,readBody,rest,store} from '../_shared/http.ts';
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
