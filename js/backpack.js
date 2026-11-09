window.BackpackUI=(()=>{
 'use strict';
 const cover=document.getElementById('backpack-open');
 const inside=document.getElementById('backpack-interior');
 const counter=document.querySelector('#shop-modal .trade-counter');
 let timer=0,opening=false;
 function reset(){
  clearTimeout(timer);opening=false;
  cover.hidden=false;cover.disabled=false;cover.classList.remove('bag-opening');
  cover.setAttribute('aria-expanded','false');inside.hidden=true;inside.classList.remove('bag-revealing');
  counter.inert=true;
 }
 function reveal(){
  clearTimeout(timer);opening=false;cover.hidden=true;cover.classList.remove('bag-opening');
  inside.hidden=false;inside.classList.add('bag-revealing');counter.inert=false;
  cover.setAttribute('aria-expanded','true');
  (inside.querySelector('button.backpack-slot')||document.getElementById('backpack-close')).focus({preventScroll:true});
 }
 function open(){
  if(opening||cover.hidden)return;
  BowAudio.play('bag');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){reveal();return;}
  opening=true;cover.disabled=true;cover.classList.add('bag-opening');timer=setTimeout(reveal,200);
 }
 cover.addEventListener('click',open);
 document.getElementById('backpack-close').addEventListener('click',()=>{
  selectedItemKey=null;renderBackpack();renderInspectPanel();reset();cover.focus({preventScroll:true});playUIBack();
 });
 return {reset,open};
})();
