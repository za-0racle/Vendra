import {request} from './services.js';
import {ghanaLocations} from '../supabase/functions/_shared/ghana.js';
const form=document.querySelector('#order-form'),region=document.querySelector('#order-region'),city=document.querySelector('#order-city'),other=document.querySelector('#order-other-city'),otherField=document.querySelector('#other-city-field');
const totals={1:490,2:900,3:1250};
for(const name of Object.keys(ghanaLocations)){const option=new Option(name,name);region.add(option);}
function updateCity(){city.replaceChildren(new Option(region.value?'Select your town / city':'Choose a region first',''));city.disabled=!region.value;for(const name of ghanaLocations[region.value]||[])city.add(new Option(name,name));if(region.value)city.add(new Option('Other town / city','__other__'));updateOther();}
function updateOther(){const show=city.value==='__other__';otherField.hidden=!show;other.disabled=!show;other.required=show;if(!show)other.value='';}
region.addEventListener('change',updateCity);city.addEventListener('change',updateOther);
function total(){const selected=form.querySelector('[name="quantity"]:checked');document.querySelector('#order-total').textContent='GH₵ '+totals[selected.value].toLocaleString('en-GH');}
form.querySelectorAll('[name="quantity"]').forEach(input=>input.addEventListener('change',total));
document.querySelectorAll('.package .btn').forEach((button,index)=>button.addEventListener('click',()=>{form.querySelector(`[name="quantity"][value="${index+1}"]`).checked=true;total();}));
let requestKey=crypto.randomUUID();
form.addEventListener('submit',async event=>{
 event.preventDefault();const button=document.querySelector('#submit-order'),result=document.querySelector('#order-result');button.disabled=true;result.classList.remove('error');result.textContent='Submitting your order...';
 try{
  const data=Object.fromEntries(new FormData(form));data.city=city.value==='__other__'?other.value.trim():city.value;delete data.city_selection;delete data.other_city;data.requestKey=requestKey;
  const payload=await request('/functions/v1/place-order',{method:'POST',body:data});
  const ref=payload.order_number||payload.id;result.textContent=payload.message+' Order reference: '+ref;
  const confirmation={reference:ref,trackingUrl:payload.tracking_url||'',emailProvided:Boolean(data.email),emailStatus:payload.customer_email_status||'pending',createdAt:Date.now()};
  let destination='/thank-you.html';
  try{sessionStorage.setItem('vendrahub-confirmation',JSON.stringify(confirmation));}
  catch{const fallback=new URLSearchParams({order:ref,email:confirmation.emailProvided?confirmation.emailStatus:'not_requested'});if(payload.tracking_url){const token=new URL(payload.tracking_url).hash;fallback.set('tracking',token);}destination+='#'+fallback.toString();}
  form.reset();updateCity();total();requestKey=crypto.randomUUID();
  window.location.assign(destination);
 }catch(error){result.classList.add('error');result.textContent=error.message||'Unable to submit your order. Please try again.';}
 finally{button.disabled=false;}
});
const mobile=document.querySelector('.mobile-order');
if(mobile&&'IntersectionObserver' in window)new IntersectionObserver(entries=>mobile.classList.toggle('is-hidden',entries[0].isIntersecting),{threshold:0}).observe(form);
