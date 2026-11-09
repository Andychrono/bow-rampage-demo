/* Persistent accomplishments; rewards never alter combat or economy. */
((root)=>{
 'use strict';
 const PREFIX='bbl_demo_online_v1_',KEY=PREFIX+'achievements_v1';
 const vocations=['Knight','Sorcerer','Druid','Archer'];
 const playedSeconds=state=>Number.isFinite(state.playedSeconds)?Math.max(0,state.playedSeconds):0;
 function formatPlayed(seconds){
  const total=Math.floor(seconds);
  return [Math.floor(total/3600),Math.floor(total/60)%60,total%60]
   .map(value=>String(value).padStart(2,'0')).join(':');
 }
 const catalog=[
  {id:'played_hour',name:'Uma hora de jornada',group:'Jornada',desc:'Acumule uma hora em partidas.',goal:3600,value:s=>Math.floor(playedSeconds(s)),format:formatPlayed},
  ...[[1,'Primeiro abate'],[100,'Abrindo caminho'],[1000,'Veterano de batalha']].map(([goal,name])=>({id:'kills_'+goal,name,group:'Combate',desc:goal===1?'Derrote sua primeira criatura.':`Derrote ${goal} criaturas.`,goal,value:s=>s.kills||0})),
  ...[['witch','Uma visita inesperada','Encontre a bruxa.'],['merchant','Negócio fechado','Recupere a sacolinha do Gustav.'],['crowBonus','Um alvo improvável','Acerte o corvo bônus.'],['pacts','O preço do poder','Aprenda o pacto na bruxa.']].map(([id,name,desc])=>({id,name,desc,group:'Descobertas',secret:true,goal:1,value:s=>s.facts?.[id]?1:0})),
  {id:'first_spell',name:'Primeiro ensinamento',desc:'Aprenda uma magia no Caldeirão.',group:'Ensinamentos',goal:1,value:s=>Object.keys(s.spells||{}).length},
  ...vocations.map(v=>({id:'first_spell_'+v,name:'Primeira magia de '+v,desc:`Aprenda a primeira magia de ${v}.`,group:'Ensinamentos',goal:1,value:s=>Object.keys(s.spells||{}).some(k=>k.startsWith(v+':'))?1:0})),
  ...vocations.map(v=>({id:'dusk_'+v,name:'Anoitecer de '+v,desc:`Chegue ao Anoitecer na Floresta das Slimes com ${v}.`,group:'Vocações',goal:1,value:s=>s.facts?.['dusk_'+v]||s.facts?.['win_'+v]?1:0})),
  ...vocations.map(v=>({id:'master_'+v,name:'Ensinamentos de '+v,desc:`Aprenda as quatro magias de ${v}.`,group:'Ensinamentos',goal:4,value:s=>Object.keys(s.spells||{}).filter(k=>k.startsWith(v+':')).length})),
  {id:'first_buff',name:'Uma força que permanece',desc:'Compre uma melhoria permanente no grimório.',group:'Ensinamentos',goal:1,value:s=>s.facts?.buff?1:0},
  ...[['king_slime','Caminho para o pico'],['phoenix','Além do amanhecer']].map(([id,name])=>({id:'key_'+id,name,desc:id==='king_slime'?'Forje a Chave do King Slime.':'Forje a Chave da Fênix.',group:'Criação',secret:true,goal:1,value:s=>s.facts?.['key_'+id]?1:0})),
  {id:'king',name:'Fim do reinado',desc:'Derrote o King Slime.',group:'Combate',goal:1,value:s=>s.facts?.king?1:0},
  ...vocations.map(v=>({id:'win_'+v,name:'Vitória de '+v,desc:`Vença a Floresta das Slimes com ${v}.`,group:'Vocações',goal:1,value:s=>s.facts?.['win_'+v]?1:0}))
 ].filter(a=>!['crowBonus','pacts','key_king_slime','key_phoenix'].includes(a.id));
 function read(){try{const s=JSON.parse(root.localStorage.getItem(KEY)||'{}');return s&&typeof s==='object'&&!Array.isArray(s)?s:{};}catch{return {};}}
 function visible(state=read()){
  return catalog.filter(a=>{
   if(root.GameMode?.dev||state.unlocked?.[a.id])return true;
   if(a.id.startsWith('kills_')||a.id==='played_hour')return true;
   if(a.id==='first_spell'||a.id.startsWith('first_spell_')||a.id==='first_buff'||a.id.startsWith('master_'))return state.facts?.witch===true;
   if(a.id.startsWith('dusk_'))return root.BowDiscovery?.gardenerUnlocked()===true;
   if(a.id==='king')return state.facts?.king_seen===true||state.facts?.king===true;
   if(a.id.startsWith('win_'))return state.facts?.king===true;
   return false;
  });
 }
 function commit(change,silent=false){const s=read();s.facts={...s.facts};s.spells={...s.spells};s.unlocked={...s.unlocked};change(s);const fresh=[];for(const a of catalog)if(!s.unlocked[a.id]&&a.value(s)>=a.goal){s.unlocked[a.id]=Date.now();fresh.push(a);}try{root.localStorage.setItem(KEY,JSON.stringify(s));}catch{return false;}if(!silent)for(const a of fresh)notify(a);return true;}
 function kill(){return commit(s=>{s.kills=Math.max(0,Number(s.kills)||0)+1;});}
 function addPlayedTime(seconds){
  if(!Number.isFinite(seconds)||seconds<=0)return false;
  return commit(s=>{s.playedSeconds=playedSeconds(s)+seconds;});
 }
 function fact(id){return commit(s=>{s.facts[id]=true;});}
 function snapshot(save,discoveries,silent=false){return commit(s=>{for(const id of ['witch','merchant','crowBonus','pacts'])if(discoveries?.[id]===true)s.facts[id]=true;for(const [voc,spells] of Object.entries(root.BowTeachings?.CATALOG||{}))for(const spell of spells)if(save?.spells?.[voc]?.[spell.id]===true)s.spells[voc+':'+spell.id]=true;if(Object.values(save?.upgrades||{}).some(n=>Number(n)>0))s.facts.buff=true;for(const id of ['king_slime','phoenix'])if(save?.craftedKeys?.[id]===true)s.facts['key_'+id]=true;},silent);}
 function sync(silent=false){if(root.GameMode?.dev)return;let save;try{save=JSON.parse(root.localStorage.getItem(PREFIX+'save_v1')||'{}');}catch{return;}snapshot(save,root.BowDiscovery?.read(),silent);}
 const queue=[];let showing=false;
 function notify(a){if(!root.document)return;queue.push(a);if(!showing)next();}
 function next(){const a=queue.shift();if(!a){showing=false;return;}showing=true;const el=root.document.createElement('aside');el.className='achievement-toast';el.setAttribute('role','status');const small=root.document.createElement('small');small.textContent='CONQUISTA DESBLOQUEADA';const title=root.document.createElement('strong');title.textContent=a.name;el.append(small,title);root.document.body.append(el);setTimeout(()=>{el.remove();next();},3400);}
 function mount(){sync(true);const dialog=root.document.createElement('dialog');dialog.id='achievements-dialog';dialog.setAttribute('aria-labelledby','achievements-title');dialog.innerHTML='<header><div><small>REGISTROS DA JORNADA</small><h1 id="achievements-title">CONQUISTAS</h1></div><button type="button" class="achievement-close">VOLTAR</button></header><p class="achievement-playtime"></p><p class="achievement-summary"></p><nav aria-label="Filtrar conquistas"></nav><div class="achievement-list"></div>';root.document.body.append(dialog);let filter='Todas';
 function render(){const s=read(),entries=visible(s),count=entries.filter(a=>s.unlocked?.[a.id]).length;dialog.querySelector('.achievement-playtime').textContent=`Tempo em partida · ${formatPlayed(playedSeconds(s))}`;dialog.querySelector('.achievement-summary').textContent=`${count} de ${entries.length} conquistas reveladas concluídas`;const list=dialog.querySelector('.achievement-list');list.replaceChildren();for(const a of entries){const done=!!s.unlocked?.[a.id];if(filter==='Concluídas'&&!done||filter==='Pendentes'&&done)continue;const hidden=a.secret&&!done,card=root.document.createElement('article');card.className='achievement-card'+(done?' is-complete':'');const title=root.document.createElement('h2');title.textContent=hidden?'Conquista secreta':a.name;const tag=root.document.createElement('small');tag.textContent=done?'CONCLUÍDA':hidden?'DESCOBERTA OCULTA':a.group.toUpperCase();const desc=root.document.createElement('p');desc.textContent=hidden?'Continue explorando para revelar este registro.':a.desc;card.append(tag,title,desc);if(!hidden){const progress=root.document.createElement('progress');progress.max=a.goal;progress.value=Math.min(a.goal,Math.max(0,a.value(s)));progress.setAttribute('aria-label',a.name);const n=root.document.createElement('span');n.textContent=a.format?`${a.format(progress.value)} / ${a.format(a.goal)}`:`${progress.value} / ${a.goal}`;if(a.format)card.classList.add('has-time-progress');card.append(progress,n);}list.append(card);}for(const b of dialog.querySelectorAll('nav button'))b.setAttribute('aria-pressed',String(b.textContent===filter));}
 for(const text of ['Todas','Concluídas','Pendentes']){const b=root.document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>{filter=text;render();};dialog.querySelector('nav').append(b);}dialog.querySelector('.achievement-close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 for(const button of root.document.querySelectorAll('[data-open-achievements]'))button.onclick=()=>{sync(true);render();dialog.showModal();};
 }
 root.BowAchievements={catalog,read,kill,fact,snapshot,sync,visible,addPlayedTime};
 root.addEventListener?.('bow-progress-changed',()=>sync());root.addEventListener?.('bow-discovery-changed',()=>sync());
 if(root.document){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',()=>{if(root.document.querySelector('[data-open-achievements]'))mount();});else if(root.document.querySelector('[data-open-achievements]'))mount();}
})(typeof window!=='undefined'?window:globalThis);
