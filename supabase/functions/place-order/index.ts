import {validateOrder,sameOrder,notifyOrder} from '../_shared/orders.js';
import {env,configured,cors,json,readBody,rest,store} from '../_shared/http.ts';
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
