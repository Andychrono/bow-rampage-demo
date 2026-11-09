/* O pacto só é gravado ao concluir o ritual. Sair antes disso cancela a oferenda. */
window.CauldronRitual=(()=>{
 'use strict';
 const panel=document.getElementById('witch-cauldron');
 let selected=null,vocation=null,busy=false,timer=0,flight=null;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const messages={witch:'Encontre a bruxa para aprender este ensinamento.',sealed:'Este ensinamento ainda está selado.',previous:'Aprenda o ensinamento anterior primeiro.',ingredients:'Reúna os ingredientes desta receita.',learned:'Este ensinamento já acompanha suas jornadas.'};
 function cancel(){clearTimeout(timer);timer=0;busy=false;flight?.remove();flight=null;panel.classList.remove('ritual-brewing');panel.removeAttribute('aria-busy');}
 function revealed(save,spell){
  const spells=BowTeachings.CATALOG[vocation]||[];
  const previous=spells.filter(entry=>entry.slot<spell.slot&&entry.available).at(-1);
  return GameMode.dev||BowTeachings.known(save,vocation,spell.id)||!previous||BowTeachings.known(save,vocation,previous.id);
 }
 function render(save,voc){
  cancel();if(vocation!==voc){vocation=voc;selected=null;}
  const spells=BowTeachings.CATALOG[voc]||[];
  if(selected&&!spells.some(spell=>spell.id===selected&&revealed(save,spell)))selected=null;
  panel.innerHTML=`<div class="scroll-desk"><p class="cauldron-eyebrow">ENSINAMENTOS · ${voc.toUpperCase()}</p><div class="scroll-rack" aria-label="Pergaminhos de habilidades">${spells.map(s=>`<button type="button" class="rolled-scroll ${BowTeachings.known(save,voc,s.id)?'scroll-learned':''} ${revealed(save,s)?'':'scroll-locked'}" data-scroll="${s.id}" aria-expanded="${selected===s.id}" aria-controls="spell-parchment" ${revealed(save,s)?'':'disabled aria-label="Pergaminho selado. Aprenda a magia anterior para abrir."'}><span class="scroll-key">${s.key}</span><span class="scroll-name">${revealed(save,s)?s.name:'Pergaminho selado'}</span>${revealed(save,s)?'':'<svg class="scroll-lock" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg><small class="scroll-lock-note">Aprenda a magia anterior</small>'}<span class="scroll-seal" aria-hidden="true"></span></button>`).join('')}</div><section id="spell-parchment" class="spell-parchment" aria-live="polite"></section></div><div class="cauldron-scene"><img class="cauldron-art" src="assets/props/witch-cauldron.webp" alt="Caldeirão de magia violeta na cabana da bruxa"><div class="cauldron-aura" aria-hidden="true"></div><div class="cauldron-caption"><span>OFERENDA E PACTO</span><p id="cauldron-status" role="status">Abra um pergaminho para conhecer seu ensinamento.</p></div></div>`;
  panel.querySelectorAll('[data-scroll]').forEach(button=>button.addEventListener('click',()=>open(button.dataset.scroll)));
  show(save);
 }
 function open(id){
  const spell=BowTeachings.get(vocation,id);
  if(busy||!spell||!revealed(loadSaveData(),spell))return false;
  selected=selected===id?null:id;playUISelect();
  panel.querySelectorAll('[data-scroll]').forEach(b=>b.setAttribute('aria-expanded',b.dataset.scroll===selected));
  show(loadSaveData());
  (selected?panel.querySelector('.close-parchment'):panel.querySelector(`[data-scroll="${id}"]`))?.focus({preventScroll:true});return true;
 }
 function close(){
  const previous=selected;if(!previous)return false;
  cancel();selected=null;render(loadSaveData(),vocation);
  panel.querySelector('.scroll-desk').scrollTop=0;
  panel.querySelector(`[data-scroll="${previous}"]`)?.focus();playUIBack();return true;
 }
 function spellGuide(spell){
  const combatCatalog=vocation==='Archer'?ArcherSpells.CATALOG:VocationSpells.CATALOG[vocation];
  const combat=combatCatalog?.find(entry=>entry.id===spell.id);
  if(!combat?.cooldown)return '';
  const aimed=Object.hasOwn(VocationSpells.TARGETED,spell.id);
  const orbital=['guardians','royal_protection','arcane_protection'].includes(spell.id);
  const action=aimed?'Segure o atalho, mire no ponto desejado e solte quando a marca estiver verde.':'Pressione o atalho para lançar.';
  return `<div class="parchment-guide"><p><strong>Como usar</strong> ${action}</p><p><strong>Atalho padrão</strong> ${spell.key} <strong>Recarga base</strong> ${combat.cooldown} s${orbital?' após consumir a última proteção':''}</p></div><details class="spell-preview"><summary>VER DEMONSTRAÇÃO</summary><div></div></details>`;
 }
 function show(save){
  const paper=panel.querySelector('#spell-parchment'),spell=BowTeachings.get(vocation,selected);
  if(!spell){panel.querySelector('#cauldron-status').textContent='Abra um pergaminho para conhecer seu ensinamento.';panel.dataset.scrollOpen='false';paper.className='scroll-invitation';paper.innerHTML='<span class="ink-flourish" aria-hidden="true"></span><h3>Magia guardada em pergaminhos</h3><p>Escolha um ensinamento. A receita será revelada ao abrir o selo.</p>';return;}
  panel.dataset.scrollOpen='true';
  const check=BowTeachings.inspect(save,vocation,spell.id,BowDiscovery.witchUnlocked()),learned=check.reason==='learned';
  panel.querySelector('#cauldron-status').textContent=check.ok?'Assine o pergaminho para firmar o pacto.':messages[check.reason]||'';
  paper.className='spell-parchment'+(learned?' parchment-learned':'');
  paper.innerHTML=`<button class="close-parchment parchment-back" type="button">‹ VOLTAR AOS PERGAMINHOS</button><div class="parchment-heading"><img src="${spell.art}" alt=""><div><span>ENSINAMENTO ${spell.key}</span><h3>${spell.name}</h3></div></div><p class="parchment-description">${spell.desc}</p>${spellGuide(spell)}<div class="parchment-ingredients" aria-label="Ingredientes da receita">${Object.entries(spell.recipe).map(([key,n])=>`<div class="parchment-ingredient ${BowTeachings.quantity(save,key)>=n?'enough':''}"><img src="${BowTeachings.ORBS[key].art}" alt=""><span>${BowTeachings.ORBS[key].name}</span><strong>${BowTeachings.quantity(save,key)} / ${n}</strong></div>`).join('')}</div><p class="parchment-condition">${check.ok?'Ofereça estes orbs para aprender a magia.':messages[check.reason]||''}</p>${learned?'<p class="pact-signature learned-signature"></p><span class="pact-learned">ENSINAMENTO APRENDIDO</span>':`<label class="signature-label" for="pact-signature">Sua assinatura<input id="pact-signature" class="pact-signature" type="text" maxlength="32" autocomplete="off" placeholder="Assine seu nome" ${!check.ok?'disabled':''}></label><button id="witch-learn" type="button" class="seal-pact" disabled>${!spell.available?'ENSINAMENTO SELADO':'ASSINAR E SELAR PACTO'}</button>`}`;
  paper.querySelector('.close-parchment').addEventListener('click',close);
  const preview=paper.querySelector('.spell-preview');
  preview?.addEventListener('toggle',()=>{
   const frame=preview.querySelector('div');
   frame.replaceChildren();
   if(!preview.open)return;
   const image=document.createElement('img');
   image.src=spell.art.replace('/spell-icons/','/spell-previews/').replace(/\.webp$/,'.gif');
   image.alt='Demonstração de '+spell.name+' na arena';
   frame.append(image);
  });
  if(learned){paper.querySelector('.learned-signature').textContent=save.spellSignatures?.[vocation]?.[spell.id]||'Pacto firmado';}
  else{
   const input=paper.querySelector('#pact-signature'),button=paper.querySelector('#witch-learn');
   input.addEventListener('input',()=>{button.disabled=!check.ok||input.value.trim().length<2;});
   input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!button.disabled){event.preventDefault();begin(spell.id);}});
   button.addEventListener('click',()=>begin(spell.id));
  }
 }
 function begin(id=selected){
  if(busy||panel.hidden||document.getElementById('witch-modal').hidden||id!==selected)return false;
  const name=panel.querySelector('#pact-signature')?.value.trim().slice(0,32);if(!name||name.length<2)return false;
  const check=BowTeachings.inspect(loadSaveData(),vocation,id,BowDiscovery.witchUnlocked());
  if(!check.ok){show(loadSaveData());return false;}
  BowAudio.play('signature');BowAudio.play('cauldron',{delay:.6});busy=true;panel.setAttribute('aria-busy','true');panel.classList.add('ritual-brewing');
  panel.querySelectorAll('button:not(.parchment-back),input').forEach(el=>el.disabled=true);
  panel.querySelector('#cauldron-status').textContent='O pacto foi assinado. A magia desperta no caldeirão…';
  if(innerWidth<=480)panel.scrollTop=0;
  const from=panel.querySelector('#spell-parchment').getBoundingClientRect(),scene=panel.querySelector('.cauldron-scene').getBoundingClientRect();
  const fromX=from.left+from.width/2,fromY=Math.min(innerHeight-70,Math.max(80,from.top+from.height/2));
  flight=document.createElement('div');flight.className='ritual-flight';flight.setAttribute('aria-hidden','true');
  flight.textContent=BowTeachings.get(vocation,id).name;
  Object.assign(flight.style,{left:fromX+'px',top:fromY+'px'});
  flight.style.setProperty('--flight-x',(scene.left+scene.width*.5-fromX)+'px');
  flight.style.setProperty('--flight-y',(scene.top+scene.height*.46-fromY)+'px');
  document.body.appendChild(flight);playShopOpenSound();
  const request={voc:vocation,id,name};
  timer=setTimeout(()=>complete(request),reduced()?160:2100);return true;
 }
 function complete(request){
  if(!busy)return;
  if(panel.hidden||document.getElementById('witch-modal').hidden||request.voc!==vocation){cancel();return;}
  const result=BowTeachings.learn(loadSaveData(),request.voc,request.id,BowDiscovery.witchUnlocked());
  if(result.ok)result.save.spellSignatures={...result.save.spellSignatures,[request.voc]:{...result.save.spellSignatures?.[request.voc],[request.id]:request.name}};
  const saved=result.ok&&saveGameData(result.save);
  cancel();render(loadSaveData(),request.voc);
  if(saved){
   playShopBuySound();witchSay('O pacto está firmado. A magia que despertou no caldeirão agora é sua.',true);
   panel.querySelector('#cauldron-status').textContent=BowTeachings.get(request.voc,request.id).name+' aprendida.';
   panel.classList.add('ritual-complete');setTimeout(()=>panel.classList.remove('ritual-complete'),900);
  }else{
   playShopErrorSound();panel.querySelector('#cauldron-status').textContent=result.ok?'Não foi possível guardar o pacto. Seus orbs foram preservados.':messages[result.reason]||'A oferenda não pôde ser concluída.';
  }
  panel.querySelector(`[data-scroll="${request.id}"]`)?.focus({preventScroll:true});
 }
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&selected&&!panel.hidden&&!document.getElementById('witch-modal').hidden){event.preventDefault();event.stopImmediatePropagation();close();}},true);
 document.querySelector('.witch-stations').addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();const modes=['buffs','spells','secrets'],index=modes.indexOf(witchStudy);
  selectWitchStudy(event.key==='Home'?modes[0]:event.key==='End'?modes[2]:modes[(index+(event.key==='ArrowLeft'?2:1))%3]);
 });
 return {render,open,close,begin,cancel,get busy(){return busy;},get selected(){return selected;}};
})();
