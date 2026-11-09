window.StageSelection=(()=>{
 'use strict';
 const modal=document.getElementById('stage-modal'),roster=document.querySelector('.arcade-wrapper'),reveal=document.getElementById('reveal-screen');
 let selected='slime_forest',mode='normal',previousFocus=null,confirmed=false;
 const cards=document.getElementById('stage-options'),details=document.getElementById('stage-details');
 const title=document.getElementById('stage-title');
 const lock='<svg viewBox="0 0 48 56" fill="none" aria-hidden="true"><path d="M12 24V15a12 12 0 0 1 24 0v9" stroke="currentColor" stroke-width="4"/><rect x="5" y="23" width="38" height="29" rx="3" fill="#0a101c" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="35" r="3" fill="currentColor"/><path d="M24 38v5" stroke="currentColor" stroke-width="3"/></svg>';
 function renderModes(){
  const modes=JourneyModes.available(selected),section=document.getElementById('stage-modes');
  if(!modes.includes(mode))mode='normal';

  document.getElementById('stage-mode-options').innerHTML=modes.map(id=>`<button type="button" data-mode="${id}" aria-pressed="${mode===id}">${JourneyModes.labels[id]}</button>`).join('');
  const best=mode==='fast'?JourneyModes.best(selected,currentSelectedVocation):null;
  const descriptions={
   normal:'Enfrente as hordas da fase, reúna ouro e materiais e descubra novos caminhos.',
   fast:'A fase roda em velocidade dobrada até o chefe. A luta volta à velocidade normal. A corrida vale pelo recorde e não rende ouro ou itens.',
   survival:'Receba um bônus inicial e escolha outro aos 3:00. A partir dos 6:00, os Juramentos têm vantagem e custo e aparecem a cada 3 minutos. As hordas começam de imediato e mudam a cada minuto. A jornada vale pelo recorde e não rende ouro ou itens.'
  };
  document.getElementById('stage-mode-info').textContent=descriptions[mode]+(best===null?'':' Recorde pessoal: '+JourneyModes.format(best)+'.');
  section.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{
   mode=button.dataset.mode;renderModes();section.querySelector('[data-mode="'+mode+'"]').focus({preventScroll:true});playUISelect();
  });
  document.getElementById('stage-continue').textContent=mode==='survival'?'VER JURAMENTO INICIAL':'JOGAR';
 }
 function showDetails(){
  const stage=StageCatalog.resolve(selected);
  cards.hidden=true;details.hidden=false;
  title.textContent=stage.name;
  document.getElementById('stage-preview-art').src=stage.art;
  document.getElementById('stage-preview-title').textContent=stage.name;
  document.getElementById('stage-region').textContent=stage.region;
  document.getElementById('stage-note').textContent='';
  renderModes();
  details.querySelector('[data-mode="'+mode+'"]').focus({preventScroll:true});
 }
 function showCards(){
  cards.hidden=false;details.hidden=true;
  title.textContent='ESCOLHA SEU DESTINO';
  cards.innerHTML=StageCatalog.CATALOG.map(entry=>{
   const available=StageCatalog.available(entry.id);
   return `<button type="button" class="stage-card" data-stage="${entry.id}" ${available?'':'disabled'}><span class="stage-card-art"><img src="${entry.art}" alt="">${available?'':'<span class="stage-card-lock">'+lock+'</span>'}</span><span class="stage-card-caption"><strong>${entry.name}</strong><small>${available?entry.region:StageCatalog.lockReason(entry.id)}</small></span></button>`;
  }).join('');
  for(const button of cards.querySelectorAll('[data-stage]:not(:disabled)'))button.onclick=()=>{
   selected=button.dataset.stage;mode='normal';showDetails();playUISelect();
  };
  cards.querySelector('[data-stage="'+selected+'"]')?.focus({preventScroll:true});
 }
 function back(){
  if(details.hidden){close();return;}
  showCards();playUIBack();
 }
 function open({restore=false}={}){
  if(!document.getElementById('pact-modal').hidden||!modal.hidden)return;
  if(!restore){previousFocus=document.activeElement;mode='normal';}
  confirmed=false;selected=StageCatalog.resolve(selected).id;
  modal.hidden=false;roster.inert=true;reveal.inert=true;document.body.style.overflow='hidden';
  if(restore)showDetails();else showCards();
  playUISelect();
 }
 function close(){
  modal.hidden=true;confirmed=false;roster.inert=false;reveal.inert=false;document.body.style.overflow='';
  previousFocus?.focus({preventScroll:true});playUIBack();
 }
 function confirm(){
  if(modal.hidden||details.hidden||!StageCatalog.available(selected))return false;
  if(!JourneyModes.available(selected).includes(mode))return false;
  try{
   localStorage.setItem('bbl_demo_online_v1_stage',selected);
   localStorage.setItem('bbl_demo_online_v1_vocation',currentSelectedVocation);
   sessionStorage.removeItem('bbl_demo_online_v1_next_run_pact');
   sessionStorage.setItem('bbl_demo_online_v1_next_run_mode',mode);
  }catch{document.getElementById('stage-note').textContent='Não foi possível guardar o destino. Tente novamente.';return false;}
  confirmed=true;modal.hidden=true;
  const choosePact=mode==='normal'&&BowDiscovery.pactsUnlocked();
  if(mode!=='survival'&&!choosePact){playUIConfirm();enterArena();return true;}
  if(window.openPactSelection()===false){confirmed=false;modal.hidden=false;document.getElementById('stage-note').textContent='Não foi possível preparar a jornada. Tente novamente.';return false;}
  return true;
 }
 document.getElementById('stage-back').addEventListener('click',back);
 document.getElementById('stage-continue').addEventListener('click',()=>confirm());
 document.addEventListener('keydown',event=>{
  if(modal.hidden)return;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();back();}
  if(event.key==='Tab'){
   const buttons=[...modal.querySelectorAll('button:not(:disabled)')].filter(button=>!button.closest('[hidden]'));
   if(event.shiftKey&&document.activeElement===buttons[0]){event.preventDefault();buttons.at(-1).focus();}
   else if(!event.shiftKey&&document.activeElement===buttons.at(-1)){event.preventDefault();buttons[0].focus();}
  }
 },true);
 window.confirmStartGame=()=>open();
 return {open,close,confirm,get confirmed(){return confirmed},get selected(){return selected},get mode(){return mode}};
})();
