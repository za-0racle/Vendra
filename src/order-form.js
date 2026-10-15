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
const dialog=document.querySelector('#thank-you');let previousFocus;
function closeDialog(){dialog.close();previousFocus?.focus();}
dialog.querySelector('.thank-you-close').addEventListener('click',closeDialog);dialog.querySelector('.thank-you-done').addEventListener('click',closeDialog);
dialog.addEventListener('close',()=>previousFocus?.focus());
let requestKey=crypto.randomUUID();
form.addEventListener('submit',async event=>{
 event.preventDefault();const button=document.querySelector('#submit-order'),result=document.querySelector('#order-result');button.disabled=true;result.classList.remove('error');result.textContent='Submitting your order...';
 try{
  const data=Object.fromEntries(new FormData(form));data.city=city.value==='__other__'?other.value.trim():city.value;delete data.city_selection;delete data.other_city;data.requestKey=requestKey;
  const payload=await request('/functions/v1/place-order',{method:'POST',body:data});
  const ref=payload.order_number||payload.id;result.textContent=payload.message+' Order reference: '+ref;
  document.querySelector('#thank-you-reference').textContent=ref;
  document.querySelector('#thank-you-email').textContent=!data.email?'You did not add an email. Save your private tracking link below to check your order at any time.':payload.customer_email_status==='sent'?'Your confirmation and tracking link have been sent to '+data.email+'. Please check your inbox and spam folder.':payload.customer_email_status==='failed'?'Your order is saved, but we could not send your confirmation email yet. Save your private tracking link below.':'Your order is saved. Keep your tracking link below while your confirmation email is being processed.';
  const link=document.querySelector('#thank-you-track');link.hidden=!payload.tracking_url;link.href=payload.tracking_url||'/track.html';
  previousFocus=document.activeElement;form.reset();updateCity();total();requestKey=crypto.randomUUID();
  if(typeof dialog.showModal==='function')dialog.showModal();else result.focus();
 }catch(error){result.classList.add('error');result.textContent=error.message||'Unable to submit your order. Please try again.';}
 finally{button.disabled=false;}
});
const mobile=document.querySelector('.mobile-order');
if(mobile&&'IntersectionObserver' in window)new IntersectionObserver(entries=>mobile.classList.toggle('is-hidden',entries[0].isIntersecting),{threshold:0}).observe(form);
