import test from 'node:test';
import assert from 'node:assert/strict';
import {validateOrder,notifyOrder,notifyCustomer} from '../supabase/functions/_shared/orders.js';
const input={name:'Ama Mensah',phone:'+233 24 123 4567',email:'ama@example.com',address:'12 Sample Street, Accra',quantity:2,requestKey:'12345678-1234-1234-1234-123456789abc'};
const secrets={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-service-key',RESEND_API_KEY:'test-resend-key',EMAIL_FROM:'orders@vendrahub.com',ORDER_EMAIL:'contact@vendrahub.com',ALLOWED_ORIGINS:'https://vendrahub.example',RATE_LIMIT_SALT:'test-random-salt'};
const handlers=[];globalThis.Deno={env:{get:key=>secrets[key]},serve:handler=>handlers.push(handler)};
await import('../supabase/functions/place-order/index.ts');
await import('../supabase/functions/admin-orders/index.ts');
await import('../supabase/functions/track-order/index.ts');
const [place,admin,track]=handlers;
const origin='https://vendrahub.example';
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
function request(method='POST',data=input,extra={}){return new Request('https://example.supabase.co/functions/v1/place-order',{method,headers:{origin,'Content-Type':'application/json',...extra},...(method==='GET'||method==='OPTIONS'?{}:{body:JSON.stringify(data)})});}
function gateway({mailFail=false,isAdmin=true,validToken=true,limit=true}={}){
 const rows=[],notifications=[],sent=[];let emails=0,customerEmails=0;
 globalThis.fetch=async(url,options={})=>{
  const path=new URL(url).pathname,search=new URL(url).searchParams,data=options.body?JSON.parse(options.body):null;
  if(url==='https://api.resend.com/emails'){
   const customer=options.headers['Idempotency-Key'].startsWith('customer-');if(customer)customerEmails++;else emails++;
   assert.equal(options.headers.Authorization,'Bearer '+secrets.RESEND_API_KEY);assert.equal(data.from,'Vendrahub <orders@vendrahub.com>');
   if(customer){assert.equal(data.to[0],rows[0]?.email||input.email);assert.ok(data.text.includes('/track.html#token='));assert.ok(data.html.includes('Track your order'));}
   else{assert.equal(options.headers['Idempotency-Key'],'order-abcdef01-1234-1234-1234-123456789abc');assert.equal(data.to[0],'contact@vendrahub.com');}
   sent.push({data,key:options.headers['Idempotency-Key']});const failed=typeof mailFail==='object'?Boolean(mailFail[customer?'customer':'admin']):mailFail;
   return response(failed?{name:'validation_error'}:{id:'mail-123'},failed?422:201);
  }
  if(path==='/auth/v1/user')return response(validToken?{id:'11111111-1111-1111-1111-111111111111'}:{},validToken?200:401);
  if(path.endsWith('/order_admins'))return response(isAdmin?[{user_id:'admin'}]:[]);
  if(path.endsWith('/rpc/consume_order_limit'))return response(limit);
  if(path.endsWith('/rpc/claim_order_email')){const row=rows.find(r=>r.id===data.p_id);if(!row||!['pending','failed'].includes(row.email_status))return response(false);row.email_status='sending';return response(true);}
  if(path.endsWith('/rpc/claim_customer_notification')){
   let notification=notifications.find(n=>n.order_id===data.p_order_id&&n.event===data.p_event);
   if(!notification){notification={order_id:data.p_order_id,event:data.p_event,state:'pending'};notifications.push(notification);}
   if(!['pending','failed'].includes(notification.state))return response(false);notification.state='sending';return response(true);
  }
  if(path.endsWith('/order_customer_notifications')){
   const matches=notifications.filter(n=>(!search.get('order_id')||n.order_id===search.get('order_id').slice(3))&&(!search.get('event')||n.event===search.get('event').slice(3)));
   if(options.method==='PATCH'){matches.forEach(n=>Object.assign(n,data));return new Response(null,{status:204});}return response(matches);
  }
  if(path.endsWith('/orders')){
   if(options.method==='POST'){if(rows.some(r=>r.request_key===data.request_key))return response([]);const row={...data,id:'abcdef01-1234-1234-1234-123456789abc',created_at:new Date().toISOString(),status:'new',email_status:'pending',order_number:'VH000001',tracking_token:'11112222-1234-1234-1234-123456789abc'};rows.push(row);return response([row]);}
   const filtered=rows.filter(row=>(!search.get('id')||row.id===search.get('id').slice(3))&&(!search.get('request_key')||row.request_key===search.get('request_key').slice(3))&&(!search.get('tracking_token')||row.tracking_token===search.get('tracking_token').slice(3)));
   if(options.method==='PATCH'){filtered.forEach(row=>Object.assign(row,data));return new Response(null,{status:204});}
   return response(filtered);
  }
  throw new Error('Unexpected test request: '+url);
 };
 return {rows,notifications,sent,emailCount:()=>emails,customerEmailCount:()=>customerEmails,setMailFail:value=>mailFail=value};
}
test('prices cannot be overridden by the customer',()=>{
 for(const [quantity,total] of [[1,490],[2,900],[3,1250]])assert.equal(validateOrder({...input,quantity,total:1}).total,total);
});
test('rejects missing details, invalid quantity, invalid email and bot trap',()=>{
 for(const change of [{name:''},{address:'short'},{quantity:4},{quantity:1.5},{email:'bad'},{website:'bot'},{requestKey:'invalid'},{phone:'hello'}])assert.throws(()=>validateOrder({...input,...change}));
});
test('records order and sends Resend notification',async()=>{const g=gateway();const r=await place(request());assert.equal(r.status,201);assert.equal(g.rows.length,1);assert.equal(g.rows[0].total,900);assert.equal(g.rows[0].email_status,'sent');assert.equal(g.emailCount(),1);});
test('same submission retry does not duplicate order or email',async()=>{const g=gateway();await place(request());await place(request());assert.equal(g.rows.length,1);assert.equal(g.emailCount(),1);});
test('reusing a submission key with changed details is rejected',async()=>{const g=gateway();await place(request());const r=await place(request('POST',{...input,name:'Different Person'}));assert.equal(r.status,409);assert.equal(g.rows.length,1);});
test('failed notification retains accepted order for admin retry',async()=>{const g=gateway({mailFail:true});const r=await place(request());assert.equal(r.status,201);assert.equal(g.rows[0].email_status,'failed');assert.equal(g.rows.length,1);});
test('rate limit rejects before inserting order',async()=>{const g=gateway({limit:false});assert.equal((await place(request())).status,429);assert.equal(g.rows.length,0);});
test('unknown origin is rejected and preflight allows only configured site',async()=>{gateway();assert.equal((await place(request('POST',input,{origin:'https://other.example'}))).status,403);const r=await place(request('OPTIONS'));assert.equal(r.status,204);assert.equal(r.headers.get('Access-Control-Allow-Origin'),origin);});
test('unconfigured mail service returns unavailable without recording an order',async()=>{const g=gateway();const {env}=await import('../supabase/functions/_shared/http.ts');const key=env.RESEND_API_KEY;env.RESEND_API_KEY='';try{assert.equal((await place(request())).status,503);assert.equal(g.rows.length,0);}finally{env.RESEND_API_KEY=key;}});
test('admin requires a valid user and explicit admin membership',async()=>{gateway();assert.equal((await admin(request('GET',null))).status,401);gateway({validToken:false});assert.equal((await admin(request('GET',null,{authorization:'Bearer bad'}))).status,401);gateway({isAdmin:false});assert.equal((await admin(request('GET',null,{authorization:'Bearer user'}))).status,403);});
test('admin can list orders, update status, and reject invalid status',async()=>{const g=gateway();await place(request());const list=await admin(request('GET',null,{authorization:'Bearer admin'}));assert.equal(list.status,200);assert.equal((await list.json()).orders.length,1);const id=g.rows[0].id;const update=await admin(request('PATCH',{id,status:'dispatched'},{authorization:'Bearer admin'}));assert.equal(update.status,200);assert.equal(g.rows[0].status,'dispatched');assert.equal((await admin(request('PATCH',{id,status:'paid'},{authorization:'Bearer admin'}))).status,400);});
test('admin cannot resend a notification already accepted by Resend',async()=>{const g=gateway();await place(request());assert.equal((await admin(request('POST',{id:g.rows[0].id,action:'retry-email'},{authorization:'Bearer admin'}))).status,409);assert.equal(g.emailCount(),1);});
test('only one concurrent notification can claim an order',async()=>{let claimed=false,calls=0;const store={claim:async()=>{if(claimed)return false;claimed=true;return true;},patch:async()=>{}};await Promise.all([1,2].map(()=>notifyOrder({...validateOrder(input),id:'test'},{env:secrets,store,fetcher:async()=>{calls++;return response({id:'ok'});}})));assert.equal(calls,1);});

test('admin retry sends a failed notification without creating another order',async()=>{const g=gateway({mailFail:true});await place(request());assert.equal(g.rows[0].email_status,'failed');g.setMailFail(false);const r=await admin(request('POST',{id:g.rows[0].id,action:'retry-email'},{authorization:'Bearer admin'}));assert.equal(r.status,200);assert.equal(g.rows[0].email_status,'sent');assert.equal(g.rows.length,1);assert.equal(g.emailCount(),2);});

test('default origins permit Vendrahub domains and the Vercel alias only',async()=>{const {env}=await import('../supabase/functions/_shared/http.ts');const previous=env.ALLOWED_ORIGINS;env.ALLOWED_ORIGINS='';try{for(const origin of ['https://vendrahub.com','https://www.vendrahub.com','https://vendra-rose.vercel.app']){const good=await place(request('OPTIONS',null,{origin}));assert.equal(good.status,204);assert.equal(good.headers.get('Access-Control-Allow-Origin'),origin);}assert.equal((await place(request('OPTIONS',null,{origin:'https://other.example'}))).status,403);}finally{env.ALLOWED_ORIGINS=previous;}});

test('customer receives a separate confirmation and short reference',async()=>{const g=gateway();const r=await place(request());const body=await r.json();assert.equal(body.order_number,'VH000001');assert.ok(body.tracking_url.endsWith('#token=11112222-1234-1234-1234-123456789abc'));assert.equal(body.customer_email_status,'sent');assert.equal(g.customerEmailCount(),1);assert.equal(g.notifications[0].state,'sent');await place(request());assert.equal(g.customerEmailCount(),1);});
test('email stays optional and no customer notification is attempted without it',async()=>{const g=gateway();const r=await place(request('POST',{...input,email:''}));assert.equal(r.status,201);assert.equal((await r.json()).customer_email_status,'not_requested');assert.equal(g.emailCount(),1);assert.equal(g.customerEmailCount(),0);});
test('customer mail failure is independent of admin delivery and can be retried',async()=>{const g=gateway({mailFail:{customer:true}});const r=await place(request());assert.equal((await r.json()).customer_email_status,'failed');assert.equal(g.rows[0].email_status,'sent');assert.equal(g.notifications[0].state,'failed');assert.ok(g.notifications[0].error.includes('Resend HTTP 422'));g.setMailFail(false);const retry=await admin(request('POST',{id:g.rows[0].id,action:'retry-customer-email',event:'received'},{authorization:'Bearer admin'}));assert.equal(retry.status,200);assert.equal(g.notifications[0].state,'sent');assert.equal(g.rows.length,1);});
test('admin status change sends the customer a tracking update only once per status',async()=>{const g=gateway();await place(request());await admin(request('PATCH',{id:g.rows[0].id,status:'dispatched'},{authorization:'Bearer admin'}));assert.equal(g.customerEmailCount(),2);assert.ok(g.sent.some(mail=>mail.data.subject.includes('Dispatched')));await admin(request('PATCH',{id:g.rows[0].id,status:'dispatched'},{authorization:'Bearer admin'}));assert.equal(g.customerEmailCount(),2);});
test('tracking requires a private token and never returns customer contact details',async()=>{const g=gateway();await place(request());const good=await track(request('POST',{token:g.rows[0].tracking_token}));assert.equal(good.status,200);const {order}=await good.json();assert.equal(order.order_number,'VH000001');for(const field of ['name','phone','email','address','id','tracking_token'])assert.ok(!(field in order));assert.equal((await track(request('POST',{token:'VH000001'}))).status,400);assert.equal((await track(request('POST',{token:'00000000-0000-0000-0000-000000000000'}))).status,404);});
test('structured Ghana address is validated and safely assembled',()=>{const order=validateOrder({...input,address:undefined,region:'Greater Accra',city:'Tema',street:'12 Sample Road',landmark:'Near the school',digital_address:'GA-123-4567'});assert.equal(order.region,'Greater Accra');assert.ok(order.address.includes('Tema, Greater Accra'));assert.throws(()=>validateOrder({...input,region:'Fake Region',city:'Accra',street:'12 Sample Road'}));assert.throws(()=>validateOrder({...input,region:'Ashanti',city:'',street:'12 Sample Road'}));});
test('customer HTML escapes customer-provided content',async()=>{let captured;await notifyCustomer({...validateOrder(input),name:'<img src=x onerror=alert(1)>',id:'test',order_number:'VH000002',tracking_token:'11112222-1234-1234-1234-123456789abc'},'received',{env:secrets,store:{claimCustomer:async()=>true,patchCustomer:async()=>{}},fetcher:async(_url,options)=>{captured=JSON.parse(options.body);return response({id:'safe'});}});assert.ok(!captured.html.includes('<img src=x'));assert.ok(captured.html.includes('&lt;img'));});
