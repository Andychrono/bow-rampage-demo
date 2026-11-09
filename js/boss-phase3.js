/* Fase final: memória de cores, anel orbital e salto punitivo. */
((root)=>{
 'use strict';
 const COLORS=['normal','blue','purple','red','gray'];
 const PRESENT=3.8,INPUT=10,WINDUP=.65,JUMP=.7,LAND=.35,RETURN=.7,EXPOSED=4.5;
 const ORBIT_SPEED=.68;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function geometry(width,height){
  const orbitRadius=Math.min(280,Math.min(width,height)*.29);
  return {cx:width/2,cy:height/2,homeX:width/2,homeY:height/2-orbitRadius,orbitRadius,ringRadius:clamp(Math.min(width,height)*.14,56,120)};
 }
 function placeKing(king,state,arena){
  const orbitX=arena.cx+Math.cos(state.orbitAngle)*arena.orbitRadius;
  const orbitY=arena.cy+Math.sin(state.orbitAngle)*arena.orbitRadius;
  if(state.mode==='jump'){
   const t=clamp(1-state.timer/JUMP,0,1);
   king.x=orbitX+(arena.cx-orbitX)*t;king.y=orbitY+(arena.cy-orbitY)*t;
   king.isJumping=true;king.jumpZ=Math.sin(t*Math.PI)*2;
  }else if(state.mode==='return'){
   const t=clamp(1-state.timer/RETURN,0,1);
   king.x=arena.cx+(state.homeX-arena.cx)*t;king.y=arena.cy+(state.homeY-arena.cy)*t;
   king.isJumping=true;king.jumpZ=Math.sin(t*Math.PI)*1.5;
  }else if(state.mode==='land'){
   king.x=arena.cx;king.y=arena.cy;
  }else if(state.mode==='present'){
   king.x=state.homeX;king.y=state.homeY;
  }else{
   king.x=orbitX;king.y=orbitY;
  }
 }
 function shuffle(random){const colors=[...COLORS];for(let i=colors.length-1;i>0;i--){const j=Math.floor(clamp(random(),0,.999999)*(i+1));[colors[i],colors[j]]=[colors[j],colors[i]];}return colors;}
 function round(king,random=Math.random){
  const s=king.phase3,previous=s.sequence?.join(',');s.sequence=shuffle(random);
  if(s.sequence.join(',')===previous)s.sequence.push(s.sequence.shift());
  s.index=0;s.mode='present';s.timer=PRESENT;s.ringAngle=0;s.orbitAngle=-Math.PI/2;
  king.x=s.homeX;king.y=s.homeY;king.angle=0;king.isJumping=false;king.jumpZ=0;
 }
 function begin(king,width,height,random=Math.random){
  const a=geometry(width,height);king.phase3={width,height,homeX:a.homeX,homeY:a.homeY,sequence:[],index:0,ringAngle:0};round(king,random);
 }
 function expose(king){const s=king?.phase3;if(!s)return;s.mode='exposed';s.timer=EXPOSED;king.isJumping=false;king.jumpZ=0;}
 function hit(king,type){
  const s=king?.phase3;if(!s||s.mode!=='input')return 'ignored';
  if(type!==s.sequence[s.index]){s.index=0;return 'wrong';}
  s.index++;
  if(s.index===COLORS.length){expose(king);return 'complete';}
  return 'correct';
 }
 function resume(king,random=Math.random){if(king?.phase3)round(king,random);}
 function step(king,delta,width,height,callbacks={}){
  if(!king.phase3)begin(king,width,height,callbacks.random);
  if(king.isDefeated||!Number.isFinite(delta)||delta<0)return;
  const s=king.phase3,a=geometry(width,height);
  if(s.width!==width||s.height!==height){
   s.width=width;s.height=height;s.homeX=a.homeX;s.homeY=a.homeY;
   placeKing(king,s,a);
  }
  let remaining=delta;
  while(remaining>1e-9){
   const dt=Math.min(remaining,Math.max(0,s.timer));remaining-=dt;s.timer-=dt;
   if(s.mode==='input'){
    s.orbitAngle+=dt*ORBIT_SPEED;
    s.ringAngle+=dt*(1.55+(1-clamp(king.hp/500,0,1))*.35);
   }
   placeKing(king,s,a);
   if(s.timer>1e-9)break;
   if(s.mode==='present'){s.mode='input';s.timer=INPUT;callbacks.orbit?.();}
   else if(s.mode==='input'){s.mode='windup';s.timer=WINDUP;callbacks.warning?.();}
   else if(s.mode==='windup'){s.mode='jump';s.timer=JUMP;king.isJumping=true;}
   else if(s.mode==='jump'){
    s.mode='land';s.timer=LAND;king.x=a.cx;king.y=a.cy;king.isJumping=false;king.jumpZ=0;callbacks.damage?.(32);
    if(king.isDefeated)return;
   }else if(s.mode==='land'){s.mode='return';s.timer=RETURN;king.isJumping=true;}
   else if(s.mode==='return'||s.mode==='exposed'){round(king,callbacks.random);callbacks.round?.();}
  }
  king.angle=Math.atan2(a.cy-king.y,a.cx-king.x)-Math.PI/2;
 }
 const api={geometry,begin,hit,expose,resume,step,COLORS,PRESENT,INPUT,WINDUP,JUMP,LAND,RETURN,EXPOSED};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BossFinalPhase=api;
})(globalThis);
