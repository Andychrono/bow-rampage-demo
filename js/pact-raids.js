/* Invasões da Sobrevivência e recorde local por fase e vocação. */
window.PactRaids = (() => {
 'use strict';
 const key = 'bbl_demo_online_v1_pact_raid_records_v5';
 const opening=[
  {name:'A clareira desperta',types:['normal','mini','normal','big'],gaps:[2.1,1.7,2.4]},
  {name:'Muralha Azul',types:['blue','normal','blue','mini'],gaps:[1.2,1.7,2.2]},
  {name:'Emboscada Roxa',types:['purple','purple_small','normal','blue'],gaps:[.65,2.3,1.35]},
  {name:'Estouro Vermelho',types:['red','normal','red_large','purple'],gaps:[1.5,.65,2]},
  {name:'Cerco das Sombras',types:['gray','blue','purple','gray','normal'],gaps:[1.45,1.2,1.7]},
  {name:'Pressão Prismática',types:['prism','normal','blue','red','purple'],gaps:[1.7,1.1,1.4]}
 ];
 const late=[
  ...opening.slice(1),
  {name:'Dois Flancos',types:['blue_large','purple','red','mini'],gaps:[.45,1.85],opposite:true},
  {name:'Horda em Rajadas',types:['mini','normal','purple','red','gray'],gaps:[.35,.4,2.15]}
 ];
 function create(kills) {
  return {wave:0,completed:0,spawned:0,wait:0,killsAtStart:kills,minute:-1,pattern:null,bag:[],index:0};
 }
 function step(state,dt,alive,spawnRate,{time,prismAlive=false,spawn,announce,clear,random=Math.random}) {
  const minute=Math.max(0,Math.floor(time/60));
  if(minute!==state.minute){
   state.minute=minute;
   if(minute<opening.length)state.pattern=opening[minute];
   else{
    if(!state.bag.length)state.bag=late.filter(pattern=>pattern!==state.pattern);
    state.pattern=state.bag.splice(Math.floor(random()*state.bag.length),1)[0];
   }
   state.index=Math.floor(random()*state.pattern.types.length);
   announce(minute,state.pattern.name);
  }
  state.wait=Math.max(0,state.wait-dt);
  if(!state.wave||state.completed===state.wave){
   if(state.wait>0)return;
   state.wave++;
   state.spawned=0;
   state.count=Math.min(32,8+Math.floor(state.wave*1.5));
  }
  if(state.spawned===state.count){
   if(alive===0){
    state.completed=state.wave;
    state.wait=3;
    clear(state.completed);
   }
   return;
  }
  if(state.wait>0||alive>=12)return;
  const pattern=state.pattern;
  let type=pattern.types[state.index%pattern.types.length];
  if(type==='prism'&&(prismAlive||alive>=6))type='red';
  const growth=state.wave-1;
  const side=pattern.opposite?(state.index%2===0?-1:1):0;
  spawn(type,1+growth*.055,1+growth*.04,side);
  state.spawned++;
  const gap=pattern.gaps[state.index%pattern.gaps.length];
  state.index++;
  state.wait=(type==='prism'?Math.max(2,gap):Math.max(.35,gap/(1+minute*.055)))/spawnRate;
 }
 function read() {
  try {
   const saved=JSON.parse(localStorage.getItem(key)||'{}');
   return saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{};
  } catch {return {};}
 }
 function record(stage,vocation){
  const entry=read()[stage+':'+vocation];
  return entry&&Number.isSafeInteger(entry.wave)&&entry.wave>=0&&Number.isSafeInteger(entry.kills)&&entry.kills>=0?entry:null;
 }
 function save(stage,vocation,entry) {
  const records=read(),id=stage+':'+vocation,old=record(stage,vocation);
  if(!entry||!Number.isSafeInteger(entry.wave)||entry.wave<0||!Number.isSafeInteger(entry.kills)||entry.kills<0)return {record:old,isBest:false};
  if (old&&(old.wave>entry.wave||(old.wave===entry.wave&&old.kills>=entry.kills))) return {record:old,isBest:false};
  try {
   localStorage.setItem(key,JSON.stringify({...records,[id]:entry}));
   return {record:entry,isBest:true};
  } catch {return {record:old||null,isBest:false};}
 }
 return {create,step,record,save};
})();
