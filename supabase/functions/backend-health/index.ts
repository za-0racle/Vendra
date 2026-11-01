// Server-to-server health check. Never call from frontend JavaScript or expose its secret there.
const healthEnv=Object.fromEntries(['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','KEEPALIVE_SECRET'].map(key=>[key,Deno.env.get(key)||'']));
function healthResponse(status:number,data:unknown){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
async function equalSecret(a:string,b:string){
 const digest=async(value:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
 const [left,right]=await Promise.all([digest(a),digest(b)]);let difference=0;for(let i=0;i<left.length;i++)difference|=left[i]^right[i];return difference===0;
}
Deno.serve(async(req:Request)=>{
 if(req.method!=='GET')return healthResponse(405,{error:'Method not allowed.'});
 if(!healthEnv.SUPABASE_URL||!healthEnv.SUPABASE_SERVICE_ROLE_KEY||healthEnv.KEEPALIVE_SECRET.length<32)return healthResponse(503,{ok:false,error:'Health check is not configured.'});
 const expected='Bearer '+healthEnv.KEEPALIVE_SECRET;
 if(!await equalSecret(req.headers.get('authorization')||'',expected))return healthResponse(401,{error:'Unauthorized.'});
 try{
  // A real, read-only database request. No writes, emails, or customer details in the response.
  const response=await fetch(healthEnv.SUPABASE_URL+'/rest/v1/orders?select=id&limit=1',{method:'GET',headers:{apikey:healthEnv.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+healthEnv.SUPABASE_SERVICE_ROLE_KEY},signal:AbortSignal.timeout(10000)});
  await response.body?.cancel();
  if(!response.ok)return healthResponse(503,{ok:false,database:'unavailable'});
  return healthResponse(200,{ok:true,database:'reachable',checked_at:new Date().toISOString()});
 }catch{return healthResponse(503,{ok:false,database:'unavailable'});}
});
