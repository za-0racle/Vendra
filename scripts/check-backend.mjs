import fs from 'node:fs';
if(fs.existsSync('.env.local'))process.loadEnvFile('.env.local');
const base=(process.env.VITE_SUPABASE_URL||'').replace(/\/$/,'');
const key=process.env.VITE_SUPABASE_ANON_KEY;
if(!base||!key){console.error('Missing public Supabase settings in .env.local.');process.exit(1);}
const origin='https://vendrahub.com';
const checks=[
 {name:'Supabase public Auth connection',path:'/auth/v1/settings',method:'GET'},
 {name:'Order function: production-origin preflight',path:'/functions/v1/place-order',method:'OPTIONS'},
 {name:'Admin function: production-origin preflight',path:'/functions/v1/admin-orders',method:'OPTIONS'},
];
let failed=false;
for(const check of checks){
 try{
  const response=await fetch(base+check.path,{method:check.method,headers:{apikey:key,Origin:origin,...(check.method==='OPTIONS'?{'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'apikey, content-type'}:{})},signal:AbortSignal.timeout(10000)});
  const allowed=check.method!=='OPTIONS'||response.headers.get('access-control-allow-origin')===origin;
  const ok=response.ok&&allowed;
  console.log(`${ok?'PASS':'FAIL'} ${check.name}: HTTP ${response.status}${!allowed?' (custom domain not allowed)':''}`);
  if(!ok)failed=true;
 }catch{console.log(`UNVERIFIED ${check.name}: network connection failed or timed out.`);failed=true;}
}
console.log('Read-only check: no customer orders, emails, accounts, or database tables were created.');
process.exitCode=failed?1:0;
