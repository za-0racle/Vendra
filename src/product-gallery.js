const gallery=document.querySelector('.product-media-gallery');
if(gallery){
 const mainImage=gallery.querySelector('.gallery-main-image'),mainVideo=gallery.querySelector('.gallery-main-video'),preview=gallery.querySelector('.gallery-video-preview'),thumbs=[...gallery.querySelectorAll('.gallery-thumb')],caption=gallery.querySelector('.gallery-caption'),counter=gallery.querySelector('.gallery-counter'),fallback=gallery.querySelector('.gallery-video-error');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let current=0,visible=false,previewPaused=false;
 const pauseButton=gallery.querySelector('.gallery-preview-toggle');
 function syncPlayback(){
  const active=visible&&!document.hidden;
  const allow=active&&!reduced.matches;
  if(allow&&!previewPaused&&current!==thumbs.length-1)preview.play().catch(()=>{});else preview.pause();
  if(current!==thumbs.length-1||!active)mainVideo.pause();
 }
 function choose(index,explicit=false){
  current=(index+thumbs.length)%thumbs.length;const thumb=thumbs[current],isVideo=thumb.dataset.kind==='video';
  thumbs.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));
  mainImage.hidden=isVideo;mainVideo.hidden=!isVideo;fallback.hidden=true;
  if(!isVideo){const image=thumb.querySelector('img');mainImage.src=image.currentSrc||image.src;mainImage.alt=image.alt;mainVideo.pause();}
  caption.textContent=thumb.dataset.caption;counter.textContent=(current+1)+' / '+thumbs.length;
  syncPlayback();if(isVideo&&explicit)mainVideo.play().catch(()=>{});
 }
 thumbs.forEach((thumb,index)=>thumb.addEventListener('click',()=>choose(index,true)));
 gallery.querySelector('.gallery-previous').addEventListener('click',()=>choose(current-1,true));
 gallery.querySelector('.gallery-next').addEventListener('click',()=>choose(current+1,true));
 gallery.querySelector('.gallery-thumbnails').addEventListener('keydown',event=>{if(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(event.key)){event.preventDefault();choose(current+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1),true);thumbs[current].focus();}});
 pauseButton.addEventListener('click',()=>{previewPaused=!previewPaused;pauseButton.textContent=previewPaused?'Play preview':'Pause preview';pauseButton.setAttribute('aria-pressed',String(previewPaused));syncPlayback();});
 mainVideo.addEventListener('error',()=>fallback.hidden=false);
 reduced.addEventListener('change',()=>{if(reduced.matches)mainVideo.pause();syncPlayback();});
 document.addEventListener('visibilitychange',syncPlayback);
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncPlayback();},{threshold:0.1}).observe(gallery);else{visible=true;syncPlayback();}
 choose(0);
}
