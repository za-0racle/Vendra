const $=id=>document.getElementById(id);
let confirmation;
try{confirmation=JSON.parse(sessionStorage.getItem('vendrahub-confirmation')||'null');}catch{/* A fragment fallback supports browsers that block sessionStorage. */}
if(!confirmation&&location.hash){const params=new URLSearchParams(location.hash.slice(1));const tracking=params.get('tracking')||'';confirmation={reference:params.get('order'),trackingUrl:tracking?'/track.html'+tracking:'',emailProvided:params.get('email')!=='not_requested',emailStatus:params.get('email'),createdAt:Date.now()};}
if(confirmation&&typeof confirmation.reference==='string'&&confirmation.reference.length<=80&&Date.now()-confirmation.createdAt<86400000){
 $('thanks-eyebrow').textContent='Your order is safely with us';
 $('thanks-title').textContent='Thank you for choosing us! 💚';
 $('thanks-message').textContent='We’re happy to be part of your home. The Vendrahub team will be in touch to confirm your delivery details. A little less cleaning effort is on its way!';
 $('reference-box').hidden=false;$('thanks-reference').textContent=confirmation.reference;$('delivery-info').hidden=false;
 $('thanks-email').hidden=false;$('thanks-email').textContent=!confirmation.emailProvided?'You did not add an email. Keep your private tracking link below so you can check your order at any time.':confirmation.emailStatus==='sent'?'Your confirmation and tracking link have been sent by email. Please check your inbox and spam folder.':confirmation.emailStatus==='failed'?'Your order is saved, but we could not send your email confirmation yet. Please save your tracking link below.':'Your order is saved. Keep your tracking link below while your confirmation email is being processed.';
 if(confirmation.trackingUrl){try{const source=new URL(confirmation.trackingUrl,location.origin);const token=new URLSearchParams(source.hash.slice(1)).get('token');if(/^[a-f0-9-]{36}$/i.test(token||'')){$('thanks-track').href='/track.html#token='+encodeURIComponent(token);$('thanks-track').hidden=false;$('tracking-note').hidden=false;}}catch{/* Do not render a malformed tracking URL. */}}
}
