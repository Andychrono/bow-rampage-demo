/* Pause e resultados usam o estado real da partida, sem avançar o combate. */
window.GameScreens=(()=>{
 'use strict';
 const pauseScreen=document.getElementById('pause-screen'),result=document.getElementById('game-over-screen');
 const canvasElement=document.getElementById('viewport'),hud=document.querySelector('.hud-top'),spells=document.getElementById('spell-bar');
 let previousFocus=null;
 let settingsOpen=false;
 function settings(open,focus=true){
  settingsOpen=open;
  document.getElementById('pause-main').hidden=open;
  document.getElementById('pause-settings').hidden=!open;
  document.getElementById('pause-settings-back').hidden=!open;
  document.getElementById('pause-resume').hidden=open;
  document.getElementById('pause-stage').hidden=open;
  document.getElementById('pause-title').textContent=open?'CONFIGURAÇÕES':'MENU DA JORNADA';
  if(focus)document.getElementById(open?'pause-settings-back':'pause-settings-open').focus({preventScroll:true});
 }
 const formatTime=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;
 function snapshot(){
  const bosses=kingSlime?.isDefeated?1:0,mobs=Math.max(0,slimesDefeated-bosses*100);
  const discoveries=BowDiscovery.read();
  return {bosses,mobs,total:mobs+bosses,gold:runGold(),time:formatTime(journeyTime()),goldVisible:!acceleratedRun&&!survivalRun&&(discoveries.witch===true||discoveries.merchant===true),pactsVisible:!!selectedRunPact};
 }
 function lock(value){canvasElement.inert=value;hud.inert=value;spells.inert=value;}
 function pause(){
  if(!gameReady||isGameOver||isPaused||audioSettingsOpen)return;
  settings(false,false);
  previousFocus=document.activeElement;spellAim?.cancel();cancelChargedShot();isPaused=true;isMouseDown=false;BowAudio.stopEffects();
  document.getElementById('pause-spells').hidden = false;
  const data=snapshot();
  const cards = modifiers.selected();
  const summary = document.getElementById('modifier-summary');
  summary.hidden = bossPhaseActive || !cards.length;
  document.getElementById('boss-power-lock').hidden = !bossPhaseActive;
  summary.querySelector('p').textContent = cards.map(card => card.name + ' · Nv. ' + rank(card.id)).join(' / ');
  document.getElementById('pause-vocation').textContent=currentVocation.toUpperCase();
  document.getElementById('pause-portrait').src='assets/characters/'+currentVocation.toLowerCase()+'_idle.webp';
  document.getElementById('pause-portrait').alt=currentVocation;
  document.getElementById('pause-stage').textContent=pactRaid?'INVASÃO '+(pactRaid.wave||1):(ravenMode||egyptianMode)?currentRegion.name+' · '+MAP_STAGES[currentMapStage].label.toUpperCase():bossPhaseActive?'CLAREIRA DO REI SLIME':['CLAREIRA ENCANTADA · MANHÃ','CLAREIRA ENCANTADA · ENTARDECER','CLAREIRA ENCANTADA · ANOITECER','CLAREIRA ENCANTADA · NOITE'][currentMapStage]||'CLAREIRA ENCANTADA';
  const rows=[['TEMPO DE JORNADA',data.time],[ravenMode?'CORVOS ABATIDOS':'SLIMES ABATIDAS',data.mobs],['ABATES TOTAIS',data.total]];
  if(acceleratedRun)rows.push(['MODO','ACELERADO']);
  if(data.bosses)rows.push(['CHEFES DERROTADOS',data.bosses]);
  if(data.goldVisible)rows.push([runRewardSaved?'OURO GUARDADO':'OURO A GUARDAR',data.gold]);
  document.getElementById('pause-stats').innerHTML=rows.map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('');
  const pact=document.getElementById('pause-pact');pact.hidden=bossPhaseActive||!data.pactsVisible;
  pact.querySelector('h2').textContent=survivalRun?'JURAMENTOS DA JORNADA':'PACTO DA JORNADA';
  document.getElementById('pause-pact-name').textContent=activePacts.map(card=>card.name).join(' / ');
  document.getElementById('pause-pact-gain').textContent=activePacts.map(card=>card.gain).join(' · ');
  document.getElementById('pause-pact-loss').textContent=activePacts.map(card=>card.loss).filter(Boolean).join(' · ');
  pauseScreen.hidden=false;lock(true);document.getElementById('pause-resume').focus({preventScroll:true});
 }
 function resume(){
  if(!isPaused||modifierDialog.open)return;
  isPaused=false;isMouseDown=false;pauseScreen.hidden=true;lock(false);
  previousFocus?.focus({preventScroll:true});
 }
 function reset(){isPaused=false;pauseScreen.hidden=true;settings(false,false);lock(false);}
 function audio(){document.getElementById('audio-settings-button')?.click();}
 function showResult(){
  reset();lock(true);const data=snapshot(),victory=result.dataset.result==='victory';
  document.getElementById('go-portrait').src='assets/characters/'+currentVocation.toLowerCase()+'_idle.webp';
  document.getElementById('go-portrait').alt=currentVocation;
  document.getElementById('go-kills').previousElementSibling.textContent=ravenMode?'CORVOS ABATIDOS':'SLIMES ABATIDAS';
  document.getElementById('go-eyebrow').textContent=ravenMode?(victory?'TESTE DO PICO CONCLUÍDO':'O PICO GUARDA SUA JORNADA'):victory?'A FLORESTA TESTEMUNHOU SUA VITÓRIA':'A FLORESTA GUARDA SUA HISTÓRIA';
  document.getElementById('go-kills').textContent=data.mobs;
  document.getElementById('go-total').textContent=data.total;
  document.getElementById('go-boss').hidden=!data.bosses;
  document.getElementById('go-pact-section').hidden=!data.pactsVisible;
  document.querySelector('#go-pact-section h2').textContent=survivalRun?'JURAMENTOS DA JORNADA':'PACTO DA JORNADA';
  document.getElementById('go-pact').textContent=activePacts.map(card=>card.name).join(' / ');
  const raidRecord=document.getElementById('go-raid-record');
  raidRecord.hidden=!pactRaid;
  if(pactRaid){
   const best=pactRaid.record;
   raidRecord.querySelector('p').textContent=best?`${pactRaid.isBest?'NOVO RECORDE · ':''}${best.wave} invasões · ${best.kills} abates · ${best.pact}`:'Nenhum recorde salvo.';
  }
  const fast=document.getElementById('go-fast-summary');
  fast.hidden=!acceleratedRun&&!acceleratedUnlocked;
  if(acceleratedUnlocked)fast.querySelector('p').textContent='Modo Acelerado desbloqueado na seleção de fase.';
  else if(acceleratedRun){
   const best=acceleratedResult?.best??JourneyModes.best(currentRegion.id,currentVocation);
   fast.querySelector('p').textContent=best===null?'Conclua a corrida para registrar seu tempo.':
    (acceleratedResult?.newBest?'NOVO RECORDE · ':'RECORDE PESSOAL · ')+JourneyModes.format(best);
  }
  document.getElementById('go-reward').hidden=!data.goldVisible;
  document.getElementById('btn-restart').focus({preventScroll:true});
 }
 document.addEventListener('keydown',event=>{
  if(event.target.closest?.('dialog[open]'))return;
  if(document.getElementById('audio-settings-dialog')?.open)return;
  if(event.key==='Escape'){
   if(event.repeat)return;
   if(isGameOver)return;
   event.preventDefault();event.stopImmediatePropagation();if(isPaused&&settingsOpen)settings(false);else if(isPaused)resume();else pause();return;
  }
  const panel=isPaused?pauseScreen:isGameOver?result:null;
  if(event.key!=='Tab'||!panel)return;
  const items=[...panel.querySelectorAll('button:not(:disabled),summary,select')].filter(el=>!el.closest('[hidden]')&&el.getClientRects().length);
  if(!items.length)return;
  if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1).focus();}
  else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0].focus();}
 },true);
 window.addEventListener('bow-audio-settings',event=>{if(event.detail.open||modifierDialog.open)return;if(isPaused)document.getElementById('pause-audio').focus({preventScroll:true});else if(isGameOver)document.querySelector('.result-audio').focus({preventScroll:true});});
 return {pause,resume,reset,audio,settings,showResult,snapshot};
})();
