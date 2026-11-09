(() => {
 'use strict';
 let offers=[],previousFocus=null,starting=false;
 const offersByVocation=new Map();
 const modal=document.getElementById('pact-modal');
 const roster=document.querySelector('.arcade-wrapper'),reveal=document.getElementById('reveal-screen');
 window.openPactSelection=()=>{
  const survival=StageSelection.mode==='survival';
  document.getElementById('pact-skip').hidden=survival;
  document.getElementById('pact-title').textContent=survival?'SEU JURAMENTO INICIAL':'ESCOLHA UM PACTO';
  if(!StageSelection.confirmed){StageSelection.open();return false;}
  if(!modal.hidden||starting)return false;
  if(!['normal','survival'].includes(StageSelection.mode)||!BowDiscovery.pactsUnlocked())return false;
  previousFocus=document.activeElement;
  const offerKey=StageSelection.mode+':'+currentSelectedVocation;
  if(!offersByVocation.has(offerKey))offersByVocation.set(offerKey,survival?VocationPacts.offer(currentSelectedVocation,[],Math.random,true).slice(0,1):RunPacts.offer());
  offers=offersByVocation.get(offerKey);
  modal.classList.toggle('is-oath',survival);
  document.getElementById('pact-vocation').textContent=currentSelectedVocation.toUpperCase();
  document.getElementById('pact-options').innerHTML=offers.map(p=>`<button class="pact-card${survival?' oath-card':''}" data-pact="${p.id}"><img class="${survival?'oath-art':'pact-art'}" src="${p.art}" alt=""><span class="pact-content"><h3>${p.name}</h3><span class="pact-label">VANTAGEM</span><p class="pact-gain">${p.gain}</p>${p.loss?`<span class="pact-label">EM TROCA</span><p class="pact-loss">${p.loss}</p>`:'<p class="pact-gain">Sem penalidade</p>'}<span class="pact-sign">${survival?'ACEITAR JURAMENTO':'ESCOLHER ESTE PACTO'}</span></span></button>`).join('');
  document.querySelectorAll('.pact-card').forEach(button=>button.addEventListener('click',()=>start(button.dataset.pact)));
  const forest=StageSelection.selected==='slime_forest';
  document.getElementById('pact-note').textContent=survival?'Receba um bônus inicial e escolha outro aos 3:00. A partir dos 6:00, os Juramentos trazem vantagem e custo. As hordas mudam a cada minuto desde o início.':forest?'O Pacto vale nas hordas e é suspenso durante a luta contra o Rei Slime.':'O Pacto vale durante esta jornada.';
  const best=survival&&forest?PactRaids.record(StageSelection.selected,currentSelectedVocation):null;
  const bestLabel=document.getElementById('pact-raid-best');
  bestLabel.hidden=!best;
  if(best)bestLabel.textContent=`RECORDE PESSOAL · ${best.wave} invasões · ${best.kills} abates · ${best.pact}`;
  modal.hidden=false;roster.inert=true;reveal.inert=true;document.body.style.overflow='hidden';
  document.querySelector('.pact-card').focus();playUISelect();return true;
 };
 function close(){if(starting)return;modal.hidden=true;roster.inert=false;reveal.inert=false;document.body.style.overflow='';previousFocus?.focus();playUIBack();StageSelection.open({restore:true});}
 function start(id){
  if(starting||modal.hidden||!BowDiscovery.pactsUnlocked()||(id===null?StageSelection.mode!=='normal':!offers.some(p=>p.id===id)))return;
  try{
   if(id===null)sessionStorage.removeItem('bbl_demo_online_v1_next_run_pact');
   else sessionStorage.setItem('bbl_demo_online_v1_next_run_pact',JSON.stringify({id,vocation:currentSelectedVocation}));
   localStorage.setItem('bbl_demo_online_v1_vocation',currentSelectedVocation);
  }
  catch{document.getElementById('pact-note').textContent='Não foi possível guardar sua escolha. Verifique o armazenamento do navegador.';return;}
  starting=true;playUIConfirm();modal.querySelectorAll('button').forEach(b=>b.disabled=true);enterArena();
 }
 document.getElementById('pact-skip').addEventListener('click',()=>start(null));
 document.getElementById('pact-back').addEventListener('click',close);
 window.addEventListener('pageshow',event=>{
  if(event.persisted){starting=false;modal.querySelectorAll('button').forEach(b=>b.disabled=false);}
 });
 document.addEventListener('keydown',event=>{
  if(modal.hidden)return;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();}
  if(event.key==='Tab'){
   const buttons=[...modal.querySelectorAll('button:not(:disabled):not([hidden])')];
   if(event.shiftKey&&document.activeElement===buttons[0]){event.preventDefault();buttons.at(-1).focus();}
   else if(!event.shiftKey&&document.activeElement===buttons.at(-1)){event.preventDefault();buttons[0].focus();}
  }
 },true);
 if(new URLSearchParams(location.search).get('choosePact')==='1'){
  const voc=localStorage.getItem('bbl_demo_online_v1_vocation');if(HERO_DATA[voc])currentSelectedVocation=voc;
  confirmStartGame();
 }
})();
