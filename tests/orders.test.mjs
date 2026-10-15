import test from 'node:test';
import assert from 'node:assert/strict';
import {validateOrder,notifyOrder} from '../supabase/functions/_shared/orders.js';
const input={name:'Ama Mensah',phone:'+233 24 123 4567',email:'ama@example.com',address:'12 Sample Street, Accra',quantity:2,requestKey:'12345678-1234-1234-1234-123456789abc'};
const secrets={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-service-key',RESEND_API_KEY:'test-resend-key',EMAIL_FROM:'orders@vendrahub.com',ORDER_EMAIL:'contact@vendrahub.com',ALLOWED_ORIGINS:'https://vendrahub.example',RATE_LIMIT_SALT:'test-random-salt'};
const handlers=[];globalThis.Deno={env:{get:key=>secrets[key]},serve:handler=>handlers.push(handler)};
await import('../supabase/functions/place-order/index.ts');
await import('../supabase/functions/admin-orders/index.ts');
const [place,admin]=handlers;
const origin='https://vendrahub.example';
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
function request(method='POST',data=input,extra={}){return new Request('https://example.supabase.co/functions/v1/place-order',{method,headers:{origin,'Content-Type':'application/json',...extra},...(method==='GET'||method==='OPTIONS'?{}:{body:JSON.stringify(data)})});}
function gateway({mailFail=false,isAdmin=true,validToken=true,limit=true}={}){
 const rows=[];let emails=0;
 globalThis.fetch=async(url,options={})=>{
  const path=new URL(url).pathname,search=new URL(url).searchParams,data=options.body?JSON.parse(options.body):null;
  if(url==='https://api.resend.com/emails'){emails++;assert.equal(options.headers.Authorization,'Bearer '+secrets.RESEND_API_KEY);assert.equal(options.headers['Idempotency-Key'],'order-abcdef01-1234-1234-1234-123456789abc');assert.equal(data.to[0],'contact@vendrahub.com');assert.equal(data.from,'Vendrahub <orders@vendrahub.com>');assert.equal(data.reply_to,input.email);return response({id:'mail-123'},mailFail?500:201);}
  if(path==='/auth/v1/user')return response(validToken?{id:'11111111-1111-1111-1111-111111111111'}:{},validToken?200:401);
  if(path.endsWith('/order_admins'))return response(isAdmin?[{user_id:'admin'}]:[]);
  if(path.endsWith('/rpc/consume_order_limit'))return response(limit);
  if(path.endsWith('/rpc/claim_order_email')){const row=rows.find(r=>r.id===data.p_id);if(!row||!['pending','failed'].includes(row.email_status))return response(false);row.email_status='sending';return response(true);}
  if(path.endsWith('/orders')){
   if(options.method==='POST'){if(rows.some(r=>r.request_key===data.request_key))return response([]);const row={...data,id:'abcdef01-1234-1234-1234-123456789abc',created_at:new Date().toISOString(),status:'new',email_status:'pending'};rows.push(row);return response([row]);}
   const filtered=rows.filter(row=>(!search.get('id')||row.id===search.get('id').slice(3))&&(!search.get('request_key')||row.request_key===search.get('request_key').slice(3)));
   if(options.method==='PATCH'){filtered.forEach(row=>Object.assign(row,data));return new Response(null,{status:204});}
   return response(filtered);
  }
  throw new Error('Unexpected test request: '+url);
 };
 return {rows,emailCount:()=>emails,setMailFail:value=>mailFail=value};
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

test('default origin permits the provided Vercel site only',async()=>{const {env}=await import('../supabase/functions/_shared/http.ts');const previous=env.ALLOWED_ORIGINS;env.ALLOWED_ORIGINS='';try{const good=await place(request('OPTIONS',null,{origin:'https://vendra-rose.vercel.app'}));assert.equal(good.status,204);assert.equal(good.headers.get('Access-Control-Allow-Origin'),'https://vendra-rose.vercel.app');assert.equal((await place(request('OPTIONS',null,{origin:'https://other.example'}))).status,403);}finally{env.ALLOWED_ORIGINS=previous;}});
