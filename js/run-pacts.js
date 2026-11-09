/* Pactos de uma única partida. Não gastam ouro nem alteram melhorias salvas. */
((root)=>{
 'use strict';
 const CATALOG=[];
 const defaults={damage:1,basicDamage:1,hp:1,rate:1,resource:1,regen:1,cost:1,knock:1,speed:1,incoming:1,spawnRate:1,enemySpeed:1,lifesteal:0,pierce:0,extraShot:0,nearDamage:1,farDamage:1};
 function get(id,capabilities={}){return CATALOG.find(p=>p.id===id&&(!p.requires||capabilities[p.requires]===true))||null;}
 function effects(id,capabilities={}){return {...defaults,...get(id,capabilities)?.effects};}
 function family(p){
  if(p.requires==='offensiveSpells')return 'spells';
  if(p.requires==='drops')return 'loot';
  if(['reserve','source'].includes(p.id))return 'resource';
  if(['vampire','glass','stone','last_breath','borrowed'].includes(p.id))return 'survival';
  return 'combat';
 }
 function offer(random=Math.random,capabilities={}){
  const pool=CATALOG.filter(p=>!p.requires||capabilities[p.requires]===true);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const chosen=[],families=new Set();
  for(const p of pool){const group=family(p);if(!families.has(group)){chosen.push(p);families.add(group);}if(chosen.length===3)break;}
  return chosen;
 }
 function damage(e,base,{hp=1,maxHp=1,distance=0}={}){
  const low=hp/maxHp<.3?(e.lowHealthDamage||1):1;
  return Math.max(1,Math.round(base*e.damage*e.basicDamage*low*(distance<=220?e.nearDamage:e.farDamage)));
 }
 function lifeStolen(e,dealt,hpBefore,missing){return Math.max(0,Math.min(missing,Math.max(0,Math.min(dealt,hpBefore))*e.lifesteal));}
 const api={CATALOG,get,effects,offer,damage,lifeStolen};root.RunPacts=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
