import {request} from './services.js';
const token=new URLSearchParams(location.hash.slice(1)).get('token');
const $=id=>document.getElementById(id);
const statuses=['new','confirmed','dispatched','delivered'];
const labels={new:'Order received',confirmed:'Order confirmed',dispatched:'Dispatched',delivered:'Delivered',cancelled:'Cancelled'};
const descriptions={new:'Your order is safely with us. We will contact you to confirm delivery and payment arrangements.',confirmed:'Your order has been confirmed. We will contact you about delivery arrangements.',dispatched:'Your order has been marked as dispatched. Our team will coordinate delivery with you.',delivered:'Your order has been marked as delivered. Thank you for shopping with Vendrahub!',cancelled:'Your order has been marked as cancelled. Please contact us if you need help.'};
async function load(){
 if(!token){$('feedback').textContent='Open the private tracking link from your confirmation email or the thank-you popup to view your order.';return;}
 $('refresh-tracking').disabled=true;$('feedback').classList.remove('error');$('feedback').textContent='Checking your order...';
 try{
  const {order}=await request('/functions/v1/track-order',{method:'POST',body:{token}});
  $('tracking-card').hidden=false;$('track-reference').textContent=order.order_number;$('track-status').textContent=labels[order.status]||order.status;
  $('track-package').textContent=order.quantity+' scrubber'+(order.quantity>1?'s':'');$('track-total').textContent='GH₵ '+order.total.toLocaleString('en-GH');$('track-explanation').textContent=descriptions[order.status]||'';
  const current=statuses.indexOf(order.status);const list=order.status==='cancelled'?['cancelled']:statuses;
  $('timeline').replaceChildren(...list.map(status=>{const li=document.createElement('li'),dot=document.createElement('span'),text=document.createElement('span');dot.className='dot';const done=statuses.indexOf(status)<=current&&current>=0;dot.textContent=done?'✓':'';text.textContent=labels[status];li.append(dot,text);li.classList.toggle('complete',done);li.classList.toggle('current',status===order.status);if(status===order.status)li.setAttribute('aria-current','step');return li;}));
  $('feedback').textContent='Updated just now.';
 }catch(error){$('feedback').classList.add('error');$('feedback').textContent=error.message;}
 finally{$('refresh-tracking').disabled=false;}
}
$('refresh-tracking').addEventListener('click',load);window.addEventListener('hashchange',()=>location.reload());load();
