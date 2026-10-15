export const supabaseUrl=(import.meta.env.VITE_SUPABASE_URL||'').replace(/\/$/,'');
export const publicKey=import.meta.env.VITE_SUPABASE_ANON_KEY||'';
export const configured=()=>Boolean(supabaseUrl&&publicKey&&!supabaseUrl.includes('YOUR_PROJECT'));
export async function request(path,{method='GET',body,token}={}){
 if(!configured())throw new Error('Online service is not configured yet. Please try again later.');
 const response=await fetch(supabaseUrl+path,{method,headers:{apikey:publicKey,...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 let data;try{data=await response.json();}catch{throw new Error('The service is unavailable. Please try again later.');}
 if(!response.ok){const error=new Error(data.error_description||data.msg||data.error||'Unable to complete this request.');error.status=response.status;throw error;}
 return data;
}
