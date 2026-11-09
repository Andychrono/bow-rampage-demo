/* Abertura sem antecipar armas ou descobertas. Retornos de partida vão ao acampamento. */
(()=>{
 'use strict';
 const screen=document.getElementById('start-screen'),play=document.getElementById('start-play');
 const credits=document.getElementById('start-credits'),audio=document.getElementById('audio-settings-dialog');
 const params=new URLSearchParams(location.search),skip=params.get('camp')==='1'||params.get('choosePact')==='1';
 let leaving=false,previousTitle=document.title;
 const locked=[];
 function lock(){for(const el of document.body.children){if(el===screen||el===credits||el===audio||['SCRIPT','STYLE','LINK'].includes(el.tagName))continue;locked.push([el,el.inert]);el.inert=true;}}
 function finish(){screen.hidden=true;screen.classList.remove('is-leaving');document.body.classList.remove('start-active');document.documentElement.classList.remove('start-active');for(const [el,inert] of locked)el.inert=inert;locked.length=0;document.title=previousTitle;const title=document.querySelector('.banner-select');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}}
 function start(){if(screen.hidden||leaving||document.querySelector('dialog[open]'))return;leaving=true;window.playUIConfirm?.();screen.classList.add('is-leaving');try{const url=new URL(location.href);url.searchParams.set('camp','1');history.replaceState(null,'',url);}catch{}setTimeout(finish,matchMedia('(prefers-reduced-motion: reduce)').matches?0:600);}
 play.addEventListener('click',start);
 document.getElementById('start-audio').addEventListener('click',()=>document.getElementById('audio-settings-button')?.click());
 audio?.addEventListener('close',()=>{if(!screen.hidden)document.getElementById('start-audio').focus({preventScroll:true});});
 const originalCredits=document.querySelector('.creator-credits');if(originalCredits)document.getElementById('start-credit-content').appendChild(originalCredits.cloneNode(true));
 document.getElementById('start-credit-open').addEventListener('click',()=>credits.showModal());
 document.getElementById('start-credit-close').addEventListener('click',()=>credits.close());
 document.addEventListener('keydown',event=>{if(screen.hidden||document.querySelector('dialog[open]'))return;if(event.key==='Enter'&&!event.repeat&&(!event.target.closest('button')||event.target===play)){event.preventDefault();event.stopImmediatePropagation();start();}else if(['ArrowLeft','ArrowRight'].includes(event.key)){event.stopImmediatePropagation();}},true);
 window.StartScreen={play:start,get visible(){return !screen.hidden}};
 if(skip){screen.hidden=true;document.body.classList.remove('start-active');document.documentElement.classList.remove('start-active');return;}
 document.title='Bow Rampage';document.body.classList.add('start-active');document.documentElement.classList.add('start-active');screen.hidden=false;lock();play.focus({preventScroll:true});
 for(let i=0;i<18;i++){const mote=document.createElement('i');mote.className='start-mote';mote.style.setProperty('--x',(8+(i*37)%84)+'%');mote.style.setProperty('--y',(38+(i*17)%52)+'%');mote.style.setProperty('--delay',(-i*.47)+'s');mote.setAttribute('aria-hidden','true');screen.appendChild(mote);}
})();
