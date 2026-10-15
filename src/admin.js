import {request,configured} from './services.js';
const $=id=>document.getElementById(id);
const statuses=['new','confirmed','dispatched','delivered','cancelled'];
let session=null,orders=[];
try{session=JSON.parse(sessionStorage.getItem('vendrahub-admin')||'null');}catch{sessionStorage.removeItem('vendrahub-admin');}
function saveSession(value){session=value;if(value)sessionStorage.setItem('vendrahub-admin',JSON.stringify(value));else sessionStorage.removeItem('vendrahub-admin');}
function message(id,text,error=false){$(id).textContent=text;$(id).classList.toggle('error',error);}
function signOut(){saveSession(null);orders=[];$('orders-body').replaceChildren();$('dashboard').hidden=true;$('logout').hidden=true;$('login-panel').hidden=false;}
async function token(){
 if(!session)throw new Error('Please sign in.');
 if(session.expires_at*1000<Date.now()+60000){
  try{const data=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}});saveSession({...data,expires_at:Math.floor(Date.now()/1000)+data.expires_in});}
  catch(error){signOut();throw error;}
 }
 return session.access_token;
}
async function admin(method='GET',body){try{return await request('/functions/v1/admin-orders',{method,body,token:await token()});}catch(error){if(error.status===401){signOut();message('login-message','Your session expired. Please sign in again.',true);}throw error;}}
const money=value=>'GH₵ '+value.toLocaleString('en-GH');
function el(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
function render(){
 $('metric-total').textContent=orders.length;$('metric-new').textContent=orders.filter(o=>o.status==='new').length;$('metric-delivered').textContent=orders.filter(o=>o.status==='delivered').length;$('metric-value').textContent=money(orders.filter(o=>o.status!=='cancelled').reduce((n,o)=>n+o.total,0));
 const query=$('search').value.toLowerCase().trim(),status=$('filter-status').value;
 const filtered=orders.filter(o=>(!status||o.status===status)&&[o.name,o.phone,o.email,o.address,o.id].some(v=>v.toLowerCase().includes(query)));
 const rows=filtered.map(order=>{
  const tr=el('tr'),reference=el('td'),customer=el('td'),packageCell=el('td',order.quantity+' scrubber'+(order.quantity>1?'s':'')),total=el('td',money(order.total)),state=el('td'),email=el('td');
  const ref=el('div',order.id);ref.className='reference';reference.append(ref,el('small',new Date(order.created_at).toLocaleString('en-GH',{timeZone:'Africa/Accra'})));
  customer.append(el('strong',order.name),el('small',order.phone));if(order.email)customer.append(el('small',order.email));customer.append(el('small',order.address));
  const select=el('select');select.setAttribute('aria-label','Status for order '+order.id);
  for(const status of statuses){const option=el('option',status);option.value=status;select.append(option);}select.value=order.status;
  select.addEventListener('change',async()=>{select.disabled=true;const previous=order.status;try{await admin('PATCH',{id:order.id,status:select.value});order.status=select.value;message('dashboard-message','Order status updated.');render();}catch(error){select.value=previous;message('dashboard-message',error.message,true);}finally{select.disabled=false;}});state.append(select);
  email.append(el('div',({sent:'Accepted by Resend',failed:'Notification failed',pending:'Pending',sending:'Sending'})[order.email_status]||order.email_status));
  if(order.email_status!=='sent'){const retry=el('button','Retry notification');retry.className='secondary retry';retry.addEventListener('click',async()=>{retry.disabled=true;try{await admin('POST',{id:order.id,action:'retry-email'});await loadOrders();message('dashboard-message','Notification accepted by Resend.');}catch(error){message('dashboard-message',error.message,true);}finally{retry.disabled=false;}});email.append(retry);}
  tr.append(reference,customer,packageCell,total,state,email);return tr;
 });
 $('orders-body').replaceChildren(...rows);$('empty').hidden=filtered.length!==0;
}
async function loadOrders(){const data=await admin();orders=data.orders;$('dashboard').hidden=false;$('logout').hidden=false;$('login-panel').hidden=true;render();}
$('login-form').addEventListener('submit',async event=>{
 event.preventDefault();$('login-button').disabled=true;message('login-message','Signing in...');
 try{const input=Object.fromEntries(new FormData(event.currentTarget));const data=await request('/auth/v1/token?grant_type=password',{method:'POST',body:input});saveSession({...data,expires_at:Math.floor(Date.now()/1000)+data.expires_in});$('admin-password').value='';try{await loadOrders();}catch(error){saveSession(null);throw error;}message('login-message','');}
 catch(error){message('login-message',error.message,true);}finally{$('login-button').disabled=false;}
});
$('logout').addEventListener('click',async()=>{const access=session?.access_token;signOut();if(access)try{await request('/auth/v1/logout',{method:'POST',token:access});}catch{/* Session is already removed from this browser. */}});
$('refresh').addEventListener('click',async()=>{const button=$('refresh');button.disabled=true;try{await loadOrders();message('dashboard-message','Orders refreshed.');}catch(error){message('dashboard-message',error.message,true);}finally{button.disabled=false;}});
$('search').addEventListener('input',render);$('filter-status').addEventListener('change',render);
if(!configured())message('login-message','Admin service needs to be connected to Supabase before you can sign in.',true);
else if(session)loadOrders().catch(error=>{signOut();message('login-message',error.message,true);});
