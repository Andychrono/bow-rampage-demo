/* Permanent crafting; ingredients and keys share one atomic save. */
((root)=>{
 'use strict';
 const RECIPES=[];
 const GEM_RECIPES=[];
 const VOCATIONS=['Knight','Sorcerer','Druid','Archer'];
 function gemBalance(save,voc){
  const amount=save?.talentGems?.[voc];
  return Number.isSafeInteger(amount)&&amount>=0?amount:0;
 }
 function inspect(save,id,voc){
  const recipe=[...RECIPES,...GEM_RECIPES].find(r=>r.id===id);
  const owned=!!recipe&&!recipe.gem&&save?.craftedKeys?.[id]===true;
  const valid=!!recipe&&(!recipe.gem||(VOCATIONS.includes(voc)&&gemBalance(save,voc)<Number.MAX_SAFE_INTEGER));
  const enough=!!recipe&&Object.entries(recipe.cost).every(([key,n])=>Number.isSafeInteger(save?.inventory?.[key])&&save.inventory[key]>=n);
  return {recipe,owned,canCraft:valid&&!owned&&enough};
 }
 function craft(save,id,voc){
  const state=inspect(save,id,voc);if(!state.canCraft)return {ok:false,save};
  const next={...save,inventory:{...save.inventory}};
  if(state.recipe.gem)next.talentGems={...save.talentGems,[voc]:gemBalance(save,voc)+1};
  else next.craftedKeys={...save.craftedKeys,[id]:true};
  for(const [key,n] of Object.entries(state.recipe.cost))next.inventory[key]-=n;
  return {ok:true,save:next};
 }
 function read(){try{return JSON.parse(root.localStorage.getItem('bbl_demo_online_v1_save_v1')||'{}')||{};}catch{return {};}}
 const unlocked=(id,save=read())=>save.craftedKeys?.[id]===true;
 const api={RECIPES,GEM_RECIPES,VOCATIONS,gemBalance,inspect,craft,read,unlocked};root.BowForge=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
