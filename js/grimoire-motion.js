/* Movimento e tinta são apresentação; compras e descobertas continuam no grimório. */
window.GrimoireMotion = (() => {
 'use strict';
 const modal=document.getElementById('witch-modal'),wrap=modal.querySelector('.witch-book-wrap');
 const book=wrap.querySelector('.witch-book'),cover=document.getElementById('grimoire-open');
 const tabs=document.getElementById('witch-chapters'),footer=modal.querySelector('.witch-footer');
 const action=document.getElementById('witch-action');
 const skip=document.getElementById('grimoire-finish-writing');
 let state='closed',turnTimer=0,inkTimer=0,shineTimer=0,pending=null,flap=null;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function setState(value){state=value;wrap.dataset.bookState=value;}
 function finishWriting(){
  clearTimeout(inkTimer);book.classList.remove('ink-in-progress','ink-settling');skip.hidden=true;
  book.querySelectorAll('.ink-text').forEach(el=>el.replaceWith(document.createTextNode(el.getAttribute('aria-label'))));
 }
 function write(){
  finishWriting();
  if(state!=='open'||modal.hidden||reduced())return;
  // Revelação por bloco mantém as palavras inteiras e a leitura estável.
  book.classList.add('ink-settling');
  inkTimer=setTimeout(()=>book.classList.remove('ink-settling'),240);
 }
 function finishOpening(){
  cover.hidden=true;cover.classList.remove('cover-opening');
  book.inert=false;tabs.inert=false;footer.inert=false;action.hidden=false;setState('open');
  if(!modal.hidden){tabs.querySelector('[aria-pressed=true]')?.focus({preventScroll:true});write();}
 }
 function open(){
  if(state==='opening'){finishOpening();return;}
  if(state!=='closed')return;
  BowAudio.play('book_open');setState('opening');cover.classList.add('cover-opening');book.inert=true;
  if(reduced())finishOpening();
 }
 function clearTurn(){clearTimeout(turnTimer);flap?.remove();flap=null;book.classList.remove('page-is-turning');book.inert=state==='closed';action.inert=false;}
 function finishTurn(){
  if(!pending){if(state==='turning'){clearTurn();setState('open');}return;}
  const action=pending;pending=null;clearTurn();
  setState('open');action.render();
  if(!modal.hidden){action.focus?.();write();}
 }
 function cancelTurn(){if(state==='turning'){pending=null;clearTurn();setState('open');write();}}
 function turn(direction,render,focus){
  BowAudio.play('page_turn');finishWriting();clearTurn();pending={render,focus};
  if(state==='closed'||state==='opening'){finishOpening();finishTurn();return;}
  if(reduced()){finishTurn();return;}
  setState('turning');book.classList.add('page-is-turning');
  flap=document.createElement('div');flap.className='turning-leaf '+(direction<0?'leaf-back':'leaf-forward');flap.setAttribute('aria-hidden','true');
  // Uma cópia visual da página atual acompanha a folha, sem ações ou IDs duplicados.
  const page=book.querySelector(direction<0?'.grimoire-index':'.grimoire-lesson');
  const face=page.cloneNode(true);face.className='leaf-copy';face.inert=true;
  for(const el of [face,...face.querySelectorAll('*')]){
   el.removeAttribute('id');el.removeAttribute('onclick');el.removeAttribute('aria-pressed');
   if(el.tagName==='BUTTON'){el.disabled=true;el.tabIndex=-1;}
  }
  flap.appendChild(face);book.appendChild(flap);book.inert=true;action.inert=true;
  turnTimer=setTimeout(()=>{
   if(modal.hidden){leave();return;}
   const action=pending;pending=null;
   action?.render();action?.focus?.();
   turnTimer=setTimeout(()=>{clearTurn();setState('open');write();},180);
  },180);
 }
 function enter(){
  leave();setState('closed');cover.hidden=false;action.hidden=true;book.inert=true;tabs.inert=true;footer.inert=true;
  cover.focus({preventScroll:true});
 }
 function leave(){
  clearTimeout(shineTimer);pending=null;clearTurn();finishWriting();
  book.classList.remove('rune-inscribed');cover.classList.remove('cover-opening');cover.hidden=false;
  book.inert=true;tabs.inert=true;footer.inert=true;action.hidden=true;setState('closed');
 }
 function celebrate(){
  if(state!=='open'||reduced())return;
  clearTimeout(shineTimer);book.classList.remove('rune-inscribed');void book.offsetWidth;book.classList.add('rune-inscribed');
  shineTimer=setTimeout(()=>book.classList.remove('rune-inscribed'),720);
 }
 cover.addEventListener('click',open);skip.addEventListener('click',finishWriting);
 cover.addEventListener('animationend',event=>{
  if(state==='opening'&&event.animationName==='grimoire-open-cover')cover.hidden=true;
 });
 book.addEventListener('animationend',event=>{
  if(state==='opening'&&event.animationName==='grimoire-unfold')finishOpening();
 });
 book.addEventListener('click',event=>{if(!event.target.closest('button'))finishWriting();});
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{
  if(event.matches){if(state==='opening')finishOpening();finishTurn();finishWriting();book.classList.remove('rune-inscribed');}
 });
 return {enter,leave,open,turn,finishTurn,cancelTurn,write,finishWriting,celebrate};
})();
