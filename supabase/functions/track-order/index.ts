import {cors,json,readBody,rest} from '../_shared/http.ts';
Deno.serve(async(req:Request)=>{
 if(!cors(req))return json(req,403,{error:'This request origin is not allowed.'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)!});
 if(req.method!=='POST')return json(req,405,{error:'Method not allowed.'});
 try{
  let input;try{input=await readBody(req);}catch{return json(req,400,{error:'Invalid tracking link.'});}
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(input.token||''))return json(req,400,{error:'Invalid tracking link.'});
  const row=(await rest(`orders?tracking_token=eq.${input.token}&select=order_number,status,quantity,total,created_at`))[0];
  if(!row)return json(req,404,{error:'We could not find this order. Please check your private tracking link.'});
  return json(req,200,{order:{order_number:row.order_number,status:row.status,quantity:row.quantity,total:row.total,created_at:row.created_at}});
 }catch{return json(req,500,{error:'Unable to load your order. Please try again.'});}
});
