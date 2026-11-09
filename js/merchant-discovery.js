/* Sacolinha entre 2 e 7 min, com garantia a cada quarta jornada elegível. */
((root)=>{
 'use strict';
 const CHANCE=.02,START=120,END=420;
 const image=typeof Image==='undefined'?null:new Image();
 if(image)image.src='assets/props/gustav-discovery-bag.webp';
 function create(){return {dropped:false,item:null,counted:false};}
 function tryDrop(state,{time,x,y,unlocked=false,boss=false,recordRun=()=>false,random=Math.random}){
  if(state.dropped||unlocked||boss||time<START||time>=END)return false;
  const guaranteed=!state.counted&&recordRun();
  state.counted=true;
  if(!guaranteed&&random()>=CHANCE)return false;
  state.dropped=true;state.item={x,y,originX:x,originY:y,age:0};return true;
 }
 function step(state,dt){const item=state.item;if(item){item.age+=Math.max(0,dt);if(item.age>=10)state.item=null;}}
 function collect(state,{x,y,unlock=()=>false}){
  const item=state.item;
  if(!item||item.age<.65||item.age>=10||Math.hypot(x-item.x,y-item.y)>30)return 'miss';
  if(!unlock())return 'storage';
  state.item=null;return 'collected';
 }
 function draw(ctx,state){
  const item=state.item;if(!item)return;
  const jump=item.age<.65?Math.sin(item.age/.65*Math.PI)*24:0;
  ctx.save();if(item.age>=7)ctx.globalAlpha=.25+.75*(.5+.5*Math.cos((item.age-7)*Math.PI*8));ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(item.x,item.y+10,17,6,0,0,Math.PI*2);ctx.fill();
  if(image?.complete&&image.naturalWidth){ctx.shadowColor='#e8bd62';ctx.shadowBlur=9;ctx.drawImage(image,item.x-30,item.y-jump-34,60,60);}
  else{ctx.fillStyle='#dfb65f';ctx.font='bold 22px Georgia';ctx.textAlign='center';ctx.fillText('G',item.x,item.y-jump);}
  ctx.restore();
 }
 const api={CHANCE,START,END,create,tryDrop,step,collect,draw};root.MerchantDiscovery=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
