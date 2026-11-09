window.JourneyModes=(()=>{
 'use strict';
 const forest='slime_forest', key='bbl_demo_online_v1_fast_records';
 const labels={normal:'Normal',fast:'Acelerado',survival:'Sobrevivência'};
 function available(stage){
  const modes=['normal'];
  if(stage!==forest||window.GameMode?.demo)return modes;
  const facts=BowAchievements.read().facts;
  if(facts?.king||Object.keys(facts||{}).some(id=>id.startsWith('win_')&&facts[id]===true))modes.push('fast');
  if(BowDiscovery.pactsUnlocked())modes.push('survival');
  return modes;
 }
 function records(){
  try{
   const saved=JSON.parse(localStorage.getItem(key)||'{}');
   return saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{};
  }catch{return {};}
 }
 function best(stage,vocation){
  const seconds=records()[stage+':'+vocation];
  return Number.isFinite(seconds)&&seconds>=0?seconds:null;
 }
 function save(stage,vocation,seconds){
  const saved=records(),id=stage+':'+vocation,old=best(stage,vocation);
  if(!Number.isFinite(seconds)||seconds<0)return {best:old,newBest:false};
  if(old!=null&&old<=seconds)return {best:old,newBest:false};
  try{localStorage.setItem(key,JSON.stringify({...saved,[id]:seconds}));return {best:seconds,newBest:true};}
  catch{return {best:old??null,newBest:false};}
 }
 function format(seconds){return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(Math.floor(seconds%60)).padStart(2,'0');}
 return {available,labels,best,save,format};
})();
