/* Orbs só entram na partida depois da descoberta do Gustav. */
((root)=>{
 'use strict';
 const TYPES={normal:'slime_green_orb',big:'slime_green_orb',blue:'slime_blue_orb',purple:'slime_purple_orb',red:'slime_red_orb',gray:'slime_gray_orb'};
 const CHANCES={normal:.12,big:.16,blue:.18,purple:.16,red:.18,gray:.20},HOP=.55,LIFETIME=10,BLINK_START=7,SIZE=50;
 const create=()=>({items:[]});
 function drop(state,{type,x,y,unlocked=false,boss=false,random=Math.random,multiplier=1}){
  const key=TYPES[type];if(!unlocked||boss||!key||random()>=Math.min(1,CHANCES[type]*multiplier))return false;
  state.items.push({key,x,y,age:0});return true;
 }
 function step(state,dt){for(let i=state.items.length-1;i>=0;i--){const item=state.items[i];item.age+=Math.max(0,dt);if(item.age>=LIFETIME||item.falling&&item.age>=HOP+.45)state.items.splice(i,1);}}
 const opacity=age=>age<BLINK_START?1:.25+.75*(.5+.5*Math.cos((age-BLINK_START)*Math.PI*8));
 function collect(state,{x,y,save}){
  let count=0,failed=false,full=false;
  for(let i=state.items.length-1;i>=0;i--){const item=state.items[i];
   if(item.falling||item.age<HOP||item.age>=LIFETIME||Math.hypot(x-item.x,y-item.y)>34)continue;
   const result=save(item.key);if(result==='full'){full=true;continue;}if(!result){failed=true;continue;}
   state.items.splice(i,1);count++;
  }
  return {count,failed,full};
 }
 const images={};
 function draw(ctx,state,catalog,ground){
  for(const item of state.items){const def=catalog[item.key];if(!def)continue;
   if(!images[item.key]&&typeof Image!=='undefined'){const image=new Image();image.src=def.art;images[item.key]=image;}
   const hop=item.age<HOP?Math.sin(item.age/HOP*Math.PI)*24:0,img=images[item.key];
   ctx.save();ctx.globalAlpha=opacity(item.age);if(item.falling){const fall=Math.max(0,(item.age-HOP)/.45);ctx.globalAlpha*=1-fall;ctx.translate(item.x,item.y+fall*65);ctx.scale(1-fall*.7,1-fall*.7);ctx.translate(-item.x,-item.y);}const shadow=()=>{ctx.fillStyle=item.falling?'transparent':'#0007';ctx.beginPath();ctx.ellipse(item.x,item.y+17,18-hop*.15,6-hop*.04,0,0,Math.PI*2);ctx.fill();};if(ground)ground.paint(ctx,shadow);else shadow();
   ctx.shadowColor=def.color;ctx.shadowBlur=8+Math.sin(item.age*3)*2;
   if(img?.complete&&img.naturalWidth&&img.naturalHeight){
    const scale=SIZE/Math.max(img.naturalWidth,img.naturalHeight),width=img.naturalWidth*scale,height=img.naturalHeight*scale;
    ctx.drawImage(img,item.x-width/2,item.y-hop-height/2,width,height);
   }
   else{ctx.fillStyle=def.color;ctx.beginPath();ctx.arc(item.x,item.y-hop,10,0,Math.PI*2);ctx.fill();}
   ctx.restore();
  }
 }
 const api={TYPES,CHANCES,HOP,LIFETIME,BLINK_START,SIZE,opacity,create,drop,step,collect,draw};root.OrbDrops=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
