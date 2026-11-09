/* Regras de spells isoladas da interface e do relógio do navegador. */
((root)=>{
 'use strict';
 const CATALOG=[
  {id:'multidirectional',key:'Q',name:'Tiro Triplo',cooldown:15,icon:'assets/spell-icons/archer-q-triple-shot.webp',art:'assets/projectiles/archer/triple-shot.webp',power:1},
  {id:'guardians',key:'W',name:'Flechas Guardiãs',cooldown:22,icon:'assets/spell-icons/archer-w-guardian-arrows.webp',art:'assets/projectiles/archer/guardian-arrows.webp',power:.65},
  {id:'extermination',key:'E',name:'Flecha do Extermínio',cooldown:20,icon:'assets/spell-icons/archer-e-extermination-arrow.webp',art:'assets/projectiles/archer/extermination-arrow.webp',power:4},
  {id:'rain',key:'R',available:true,name:'Chuva de Flechas',cooldown:90,icon:'assets/spell-icons/archer-r-arrow-rain.webp',art:'assets/projectiles/archer/arrow-rain/1.webp',power:4.5}
 ];
 for(const spell of CATALOG)spell.name=root.BowI18n?.t('spell.'+spell.id+'.name',spell.name)??spell.name;
 function create(emit,random=Math.random,talents={}){
  let cooldowns={},guard=null,rain=null,devCooldown=null,followUp=null;
  const cooldown=spell=>devCooldown??talents[spell.id]?.cooldown??spell.cooldown;
  const rainDuration=talents.rain?.duration??5;
  function reset(){cooldowns=Object.fromEntries(CATALOG.map(s=>[s.id,0]));guard=null;rain=null;followUp=null;}
  function shot(id,x,y,angle,speed,extra={}){
   const spell=CATALOG.find(s=>s.id===id);
   emit({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,angle,voc:'Archer',life:1.8,trail:[],spellId:id,spellPower:spell.power,pierceLeft:0,...extra});
  }
  function cast(id,{x,y,aimX,aimY,allowed=true}){
   const spell=CATALOG.find(s=>s.id===id);
   if(!allowed||!spell||spell.available===false||cooldowns[id]>0||(id==='guardians'&&guard&&devCooldown===null))return false;
   const angle=Math.atan2(aimY-y,aimX-x);
   if(id!=='guardians'||devCooldown!==null)cooldowns[id]=cooldown(spell);
   if(id==='guardians'&&guard)for(const arrow of guard.arrows)arrow.spent=true;
   if(id==='multidirectional')for(const offset of talents.multidirectional?.count===5?[-.32,-.16,0,.16,.32]:[-.16,0,.16]){const a=angle+offset;shot(id,x+Math.cos(a)*45,y+Math.sin(a)*45,a,620);}
   if(id==='extermination'){
    const px=x+Math.cos(angle)*45,py=y+Math.sin(angle)*45;
    shot(id,px,py,angle,780,{pierceLeft:2});
    if(talents[id]?.extra)followUp={remaining:.14,fire:()=>shot(id,px,py,angle,780,{pierceLeft:2,spellPower:spell.power*.6})};
   }
   if(id==='rain')rain={elapsed:0,next:new WeakMap(),ambientNext:0,ambientWave:0,drops:[]};
   if(id==='guardians')guard={elapsed:0,angle,radius:70,arrows:Array.from({length:talents.guardians?.count??4},(_,index)=>({index,spent:false}))};

   root.BowAudio?.spell(id);
   return true;
  }
  function update(dt,{x,y,width=x*2,height=y*2,active=true,monsters=[]}){
   if(!active||!Number.isFinite(dt)||dt<=0)return;
   if(followUp&&(followUp.remaining-=dt)<=0){followUp.fire();followUp=null;}
   for(const spell of CATALOG)cooldowns[spell.id]=Math.max(0,cooldowns[spell.id]-dt);
   if(guard){
    const previousAngle=guard.angle,previousRadius=guard.radius;
    guard.elapsed+=dt;guard.angle+=dt*2.2;
    guard.radius=70+60*Math.min(1,guard.elapsed/.3);
    for(const arrow of guard.arrows){
      if(arrow.spent)continue;
      const i=arrow.index;
      const a=guard.angle+i*Math.PI*2/guard.arrows.length,old=previousAngle+i*Math.PI*2/guard.arrows.length;
      shot('guardians',x+Math.cos(a)*guard.radius,y+Math.sin(a)*guard.radius,a+Math.PI/2,0,{
       life:dt+.01,invisible:true,transient:true,
       fromX:x+Math.cos(old)*previousRadius,fromY:y+Math.sin(old)*previousRadius,
       guardArrow:arrow
      });
    }
   }
   if(rain){
    const previous=rain.elapsed;rain.elapsed+=dt;
    while(rain.ambientNext<=rain.elapsed+1e-9&&rain.ambientNext<rainDuration){
     for(let i=0;i<12;i++){const cell=(i+rain.ambientWave*5)%24;rain.drops.push({x:(cell%6+.12+random()*.76)*width/6,y:(Math.floor(cell/6)+.12+random()*.76)*height/4,age:Math.max(0,rain.elapsed-rain.ambientNext)-dt,impacted:false,ambient:true,scale:.95+random()*.3});}
     root.BowAudio?.play('arrow_flight',{volume:.5});rain.ambientWave++;rain.ambientNext+=.24;
    }
    if(previous<rainDuration)for(const target of monsters){
     if(target.hp<=0||target.x<0||target.x>width||target.y<0||target.y>height)continue;
     let next=rain.next.get(target)??previous;
     while(next<=rain.elapsed+1e-9&&next<rainDuration){rain.drops.push({x:target.x,y:target.y,age:Math.max(0,rain.elapsed-next)-dt,impacted:false,scale:.95+random()*.3});next+=.65;}
     rain.next.set(target,next);
    }
    for(const drop of rain.drops){
     drop.age+=dt;
     if(drop.age>=.43&&!drop.impacted){
      drop.impacted=true;root.BowAudio?.play('hit',{volume:.4});shot('rain',drop.x,drop.y,0,0,{life:dt+.01,invisible:true,transient:true,areaImpact:true,impactRadius:85,hitsAir:true,ambient:!!drop.ambient,spellPower:drop.ambient?1:4.5});
     }
    }
    rain.drops=rain.drops.filter(drop=>drop.age<2);
    if(rain.elapsed>=rainDuration&&rain.drops.length===0)rain=null;
   }
  }
  function consumeGuardian(arrow){
   if(!guard||!guard.arrows.includes(arrow)||arrow.spent)return false;
   arrow.spent=true;
   if(guard.arrows.every(a=>a.spent)){
    guard=null;cooldowns.guardians=cooldown(CATALOG.find(s=>s.id==='guardians'));
   }
   return true;
  }
  function setDevCooldown(value){if(root.GameMode?.dev!==true)return false;devCooldown=value===1?1:null;if(devCooldown!==null)for(const key of Object.keys(cooldowns))cooldowns[key]=Math.min(cooldowns[key],1);return true;}
  reset();
  return {setDevCooldown,cast,update,reset,consumeGuardian,get cooldowns(){return {...cooldowns}},get guard(){return guard&&{...guard,arrows:guard.arrows.map(a=>({...a}))}},get rain(){return rain&&{...rain}}};
 }
 function rainPosition(drop,height){const progress=Math.max(0,Math.min(1,drop.age/.43)),travel=Math.min(360,height*.42);return {x:drop.x,y:drop.y-travel*(1-Math.pow(progress,1.6)),landed:progress>=1};}
 const api={CATALOG,create,rainPosition};root.ArcherSpells=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
