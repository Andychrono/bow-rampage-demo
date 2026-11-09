'use strict';
let witchMoodTimer,witchPreviousFocus,witchSelected='auto_reload',witchVocation='Knight',witchSecretSelected='pacts',witchStudy='buffs';
const WITCH_CHAPTERS={Knight:{name:'KNIGHT',color:'#93c5fd'},Sorcerer:{name:'SORCERER',color:'#c084fc'},Druid:{name:'DRUID',color:'#86efac'},Archer:{name:'ARCHER',color:'#fde047'}};
function selectWitchChapter(voc){
 if(voc==='Secrets'){selectWitchStudy('secrets');return;}
 if(!WITCH_CHAPTERS[voc]||witchStudy==='secrets'||voc===witchVocation)return;
 GrimoireMotion.finishTurn();CauldronRitual.cancel();witchVocation=voc;playUISelect();renderWitchShop();
 document.querySelector('.chapter-tab[aria-pressed=true]')?.focus({preventScroll:true});
}
function witchEntries(){return witchStudy==='secrets'?WITCH_SECRETS:BowPowerups.CATALOG.filter(entry=>!entry.legacy);}
function witchPageIndex(){const id=witchStudy==='secrets'?witchSecretSelected:witchSelected;return Math.max(0,witchEntries().findIndex(entry=>entry.id===id));}
function turnWitchPage(direction){
 if(witchStudy==='spells')return;
 GrimoireMotion.finishTurn();
 const entries=witchEntries(),spread=Math.floor(witchPageIndex()/2),target=spread+(direction<0?-1:1);
 if(target<0||target>=Math.ceil(entries.length/2))return;
 playUISelect();GrimoireMotion.turn(direction,()=>{
  if(witchStudy==='secrets')witchSecretSelected=entries[target*2].id;else witchSelected=entries[target*2].id;
  renderWitchShop();
 },()=>document.querySelector('.folio-card[aria-pressed=true]')?.focus({preventScroll:true}));
}
function witchSay(text,happy=false){
  document.getElementById('witch-dialogue').textContent=text;
  const portrait=document.getElementById('witch-portrait');
  portrait.src=happy?'assets/characters/witch-happy.webp':'assets/characters/witch-neutral.webp';
  portrait.classList.toggle('happy',happy);
  clearTimeout(witchMoodTimer);
  if(happy)witchMoodTimer=setTimeout(()=>{portrait.src='assets/characters/witch-neutral.webp';portrait.classList.remove('happy');},2600);
}
function openWitchShop(){
  closeShopModal();closeReveal();witchPreviousFocus=document.activeElement;
  const modal=document.getElementById('witch-modal');modal.hidden=false;
  document.body.style.overflow='hidden';
  witchSay('A floresta esquece suas derrotas. Meus encantamentos, não. Escolha o que vai levar para a próxima jornada.');
  const voc=localStorage.getItem('bbl_demo_online_v1_vocation');if(WITCH_CHAPTERS[voc])witchVocation=voc;
  renderWitchShop();if(witchStudy==='buffs')GrimoireMotion.enter();else if(witchStudy==='spells')document.getElementById('witch-chapters').inert=false;playShopOpenSound();
}
function closeWitchShop(){
  const modal=document.getElementById('witch-modal');if(modal.hidden)return;
  CauldronRitual.cancel();GrimoireMotion.leave();modal.hidden=true;document.body.style.overflow='';clearTimeout(witchMoodTimer);
  witchPreviousFocus?.focus();playShopCloseSound();
}
function selectWitchPower(id){
 if(witchStudy!=='buffs'||!witchEntries().some(u=>u.id===id))return;
 GrimoireMotion.finishTurn();witchSelected=id;playUISelect();renderWitchShop();
 document.querySelector('.folio-card[aria-pressed=true]')?.focus({preventScroll:true});
}
function selectWitchStudy(mode){
 if(mode==='secrets')return;
 if(!['buffs','spells','secrets'].includes(mode)||mode===witchStudy)return;
 if(mode==='secrets'&&!witchSecretsVisible())return;
 CauldronRitual.cancel();
 const focus=()=>document.getElementById({buffs:'station-grimoire',spells:'station-cauldron',secrets:'station-secrets'}[mode]).focus({preventScroll:true});
 playUISelect();
 GrimoireMotion.leave();witchStudy=mode;renderWitchShop();
 if(mode==='spells')document.getElementById('witch-chapters').inert=false;else if(mode==='buffs')GrimoireMotion.enter();
 focus();
}
function openWitchTeachings(){selectWitchStudy('spells');}
function selectWitchSpell(id){return CauldronRitual.open(id);}
function learnWitchSpell(id){return CauldronRitual.begin(id);}
function buffEmblem(id){
 const paths={atk_power:'M15 40L39 8l4 5-24 31m-7-9 13 10m-8-5-6 8',max_hp:'M28 43S6 30 9 18c3-11 14-10 19-2 5-8 16-9 19 2 3 12-19 25-19 25Z',regen_spd:'M28 7C24 17 12 25 13 34a15 15 0 0 0 30 0C44 25 32 17 28 7Zm-7 30q-5-7 1-13',attack_speed:'M34 6 15 30h13l-6 20 21-27H30l4-17Z',projectile_speed:'M8 15h27m-31 13h43M12 41h23m3-21 10 8-10 8'};
 return `<svg class="folio-emblem" viewBox="0 0 56 56" aria-hidden="true"><path d="${paths[id]||paths.atk_power}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
const WITCH_BUFF_DESCRIPTIONS={atk_power:'Mais dano em todos os seus ataques.',max_hp:'Mais vida máxima em todas as jornadas.',regen_spd:'Encurta a espera para recuperar a reserva esgotada.',attack_speed:'Dispara mais rápido, mantendo o custo por disparo.',projectile_speed:'Projéteis mais rápidos para alcançar alvos ágeis.'};
function folioValue(u,n){const value=u.format(n).match(/^[+-]?[\d.]+%?/)?.[0]||u.format(n);return value+(u.id==='max_hp'?' HP':'');}
function renderBuffPage(u,save,index){
 const level=BowPowerups.level(save,u.id,witchVocation),max=level===u.maxLevel,selected=witchSelected===u.id;
 const effect=n=>u.scoped?BowPowerups.formatScoped(u,n,save,witchVocation):folioValue(u,n);
 return `<button type="button" class="folio-card buff-page ${selected?'selected':''}" data-buff="${u.id}" aria-pressed="${selected}" onclick="selectWitchPower('${u.id}')"><span class="folio-eyebrow">ENCANTAMENTO ${index+1}</span><h3>${u.name}</h3>${buffEmblem(u.id)}<p class="folio-description">${WITCH_BUFF_DESCRIPTIONS[u.id]||u.desc}</p><div class="folio-level"><span>NÍVEL ${level} / ${u.maxLevel}</span><span class="folio-ranks" aria-hidden="true">${Array.from({length:u.maxLevel},(_,i)=>`<i class="${i<level?'filled':''}"></i>`).join('')}</span></div><div class="folio-effects"><div><small>ATUAL</small><strong title="${u.scoped?effect(level):u.format(level)}">${effect(level)}</strong></div><div><small>${max?'COMPLETO':'PRÓXIMO'}</small><strong title="${u.scoped?effect(max?level:level+1):u.format(max?level:level+1)}">${effect(max?level:level+1)}</strong></div></div></button>`;
}
function renderSecretPage(entry,index){
 const learned=BowDiscovery.pactsUnlocked();
 return `<button type="button" class="folio-card secret-page ${witchSecretSelected===entry.id?'selected':''}" data-secret="${entry.id}" aria-pressed="${witchSecretSelected===entry.id}" onclick="selectWitchSecret('${entry.id}')"><span class="folio-eyebrow">SEGREDO ${index+1}</span><h3>${entry.name}</h3><span class="folio-flourish" aria-hidden="true"></span><p class="folio-description">${entry.desc}</p><span class="folio-secret-state">${learned?'SEGREDO APRENDIDO':'SEGREDO NÃO DESCOBERTO'}</span></button>`;
}
function witchSecretsVisible(){return GameMode.dev||BowDiscovery.read().crowBonus===true;}
function renderWitchShop(){
 const save=loadSaveData(),spells=witchStudy==='spells',secret=witchStudy==='secrets';
 const modal=document.getElementById('witch-modal');modal.dataset.study=witchStudy;
 document.querySelector('#witch-modal .witch-content').dataset.station=witchStudy;
 const wrap=document.getElementById('witch-grimoire-panel');wrap.hidden=witchStudy!=='buffs';wrap.dataset.study=witchStudy;
 wrap.setAttribute('aria-labelledby',secret?'station-secrets':'station-grimoire');
 document.getElementById('witch-cauldron').hidden=!spells;
 document.getElementById('witch-secrets').hidden=!secret;
 document.getElementById('station-secrets').hidden=!witchSecretsVisible();
 for(const [mode,id] of Object.entries({buffs:'station-grimoire',spells:'station-cauldron',secrets:'station-secrets'}))document.getElementById(id).setAttribute('aria-selected',mode===witchStudy);
 document.getElementById('witch-title').textContent=spells?'CALDEIRÃO DA BRUXA':secret?'SEGREDOS DA BRUXA':'GRIMÓRIO DA BRUXA';
 document.getElementById('witch-gold').textContent=save.gold;
 const chapters=document.getElementById('witch-chapters');chapters.hidden=secret;
 chapters.innerHTML=!secret?Object.keys(WITCH_CHAPTERS).map(v=>`<button class="chapter-tab" style="--chapter-color:${WITCH_CHAPTERS[v].color}" aria-pressed="${v===witchVocation}" onclick="selectWitchChapter('${v}')"><img src="assets/characters/hero_${v.toLowerCase()}.webp" alt=""><span>${v.toUpperCase()}</span></button>`).join(''):'';
 if(spells){CauldronRitual.render(save,witchVocation);return;}
 if(secret){renderWitchAction();const action=document.getElementById('witch-action');action.hidden=false;action.inert=false;return;}
 const entries=witchEntries(),start=Math.floor(witchPageIndex()/2)*2;
 if(secret)witchSecretSelected='pacts';
 document.querySelector('.witch-book').dataset.layout='folio';
 for(const [offset,id] of ['witch-catalog','witch-detail'].entries()){
  const entry=entries[start+offset];
  document.getElementById(id).innerHTML=secret?(offset===0?'<div class="pact-art-page"><img src="assets/props/pact-scroll.webp" alt="Pergaminho do pacto com um crânio e símbolos arcanos"></div>':renderSecretPage(WITCH_SECRETS[0],0)):entry?renderBuffPage(entry,save,start+offset):'<div class="folio-end"><span class="folio-flourish" aria-hidden="true"></span><h3>Fim deste capítulo</h3><p>Escolha uma vocação para comparar suas runas.</p></div>';
  document.getElementById(offset?'witch-page-right':'witch-page-left').textContent=!secret&&entry?String(start+offset+1):'';
 }
 document.getElementById('witch-chapter-counter').textContent=secret?'PACTO DA JORNADA':(start+1===entries.length?'PÁGINA '+(start+1):'PÁGINAS '+(start+1)+'–'+Math.min(start+2,entries.length))+' / '+entries.length;
 document.getElementById('witch-page-previous').hidden=secret;
 document.getElementById('witch-page-next').hidden=secret;
 document.getElementById('witch-page-previous').disabled=start===0;
 document.getElementById('witch-page-next').disabled=start+2>=entries.length;
 document.getElementById('witch-total').textContent=secret?(BowDiscovery.pactsUnlocked()?1:0):entries.reduce((sum,u)=>sum+BowPowerups.level(save,u.id,witchVocation),0);
 document.getElementById('witch-progress-label').textContent=secret?'segredo aprendido':'melhorias compradas';
 renderWitchAction();GrimoireMotion.write();
}
// O livro descreve o poder; a confirmação pertence ao balcão da bruxa.
function renderWitchAction(){
 const area=document.getElementById('witch-action'),save=loadSaveData();
 if(witchStudy==='secrets'){
  const learned=BowDiscovery.pactsUnlocked();
  const revealed=BowDiscovery.read().crowBonus===true;
  area.innerHTML=`<div class="witch-action-summary"><strong class="witch-action-title">Pactos da jornada</strong><p class="witch-price-note">${learned?'Os pactos já estão disponíveis antes das jornadas.':revealed?'O Corvo Bônus revelou este segredo. Você já pode despertar os pactos.':'Acerte o Corvo Bônus na montanha dos corvos para revelar este segredo.'}</p></div><button id="witch-unlock-pacts" class="witch-buy" onclick="unlockWitchPacts()" ${learned||!revealed?'disabled':''}>${learned?'PACTOS DESPERTOS':revealed?'DESPERTAR PACTOS':'ENCONTRE O CORVO BONUS'}</button>`;
  return;
 }
 const u=witchEntries().find(entry=>entry.id===witchSelected)||witchEntries()[0],n=BowPowerups.level(save,u.id,witchVocation),max=n===u.maxLevel,cost=BowPowerups.cost(u.id,n),can=save.gold>=cost;
 area.innerHTML=`<div class="witch-action-summary"><strong class="witch-action-title">${u.name}</strong><p class="witch-price-note">${max?'Todas as runas deste encantamento foram inscritas.':can?'A melhoria vale para as próximas partidas.':`Faltam ${cost-save.gold} moedas.`}</p><p class="witch-shared-note">${u.scoped?'Encantamento de '+witchVocation+'.':'Uma compra fortalece todas as vocações.'}</p></div><button id="witch-buy" class="witch-buy" onclick="buyUpgrade('${u.id}')" ${max||!can?'disabled':''}>${max?'ENCANTAMENTO COMPLETO':`COMPRAR · ${cost} OURO`}</button>`;
}
const WITCH_SECRETS = [{id:'pacts',name:'Pactos da jornada',desc:'Um pacto por jornada: escolha sua vantagem e aceite seu preço.'}];
function selectWitchSecret(id){
 if(witchStudy!=='secrets'||!WITCH_SECRETS.some(entry=>entry.id===id))return;
 GrimoireMotion.finishTurn();witchSecretSelected=id;playUISelect();renderWitchShop();
 document.querySelector('.folio-card[aria-pressed=true]')?.focus({preventScroll:true});
}
function buyWitchUpgrade(id){
  GrimoireMotion.finishTurn();
  if(witchStudy!=='buffs'||!BowDiscovery.witchUnlocked())return false;
  const result=BowPowerups.purchase(loadSaveData(),id,witchVocation);
  if(!result.ok){playShopErrorSound();witchSay(result.reason==='max'?'Este segredo já é seu por completo.':'Nem magia paga as contas. Traga mais ouro, viajante.');renderWitchShop();return false;}
  if(!saveGameData(result.save)){playShopErrorSound();witchSay('Não consegui guardar o encantamento. A compra não foi concluída; verifique o armazenamento do navegador.');return false;}
  playShopBuySound();updateGoldDisplays();renderWitchShop();GrimoireMotion.celebrate();
  witchSay('Ah, agora sim! O pacto está selado. Esse poder vai acompanhar todas as suas próximas jornadas.',true);
  (document.getElementById('witch-buy').disabled?document.querySelector('.folio-card.selected'):document.getElementById('witch-buy')).focus();
  return true;
}
document.addEventListener('keydown',event=>{
  const modal=document.getElementById('witch-modal');if(modal.hidden)return;
  if(['ArrowLeft','ArrowRight'].includes(event.key)&&witchStudy!=='spells'&&!event.target.closest('input,select,textarea,.witch-stations')&&document.querySelector('.witch-book-wrap').dataset.bookState==='open'){event.preventDefault();turnWitchPage(event.key==='ArrowLeft'?-1:1);}
  if(event.key==='Escape'){event.preventDefault();closeWitchShop();}
  if(event.key==='Tab'){
    const items=[...modal.querySelectorAll('button:not(:disabled),input:not(:disabled),a[href]')].filter(el=>!el.closest('[inert],[hidden]')&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');const first=items[0],last=items.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
});
function unlockWitchPacts(){
 if(document.getElementById('witch-modal').hidden||witchStudy!=='secrets')return false;
 if(BowDiscovery.pactsUnlocked())return true;
 if(!BowDiscovery.unlockPacts()){playShopErrorSound();return false;}
 playShopBuySound();renderWitchShop();GrimoireMotion.celebrate();
 witchSay('Os pactos estão despertos. Cada dádiva tem seu preço.',true);return true;
}
