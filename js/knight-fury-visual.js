/* Fúria: somente apresentação. Não controla duração, dano, munição ou disparos. */
((root)=>{
 'use strict';
 function pose(state){
  const age=Math.max(0,state?.age||0),remaining=Math.max(0,state?.remaining||0);
  const strength=Math.min(1,age/.2,remaining/.45);
  return {age,strength,flare:Math.max(0,1-age/.48),pulse:.88+.12*Math.sin(age*8),bladeSize:164};
 }
 function aura(ctx,x,y,state,ground,layer='back'){
  const view=pose(state);if(view.strength<=0)return;
  const {age,strength,flare,pulse}=view;
  ctx.save();ctx.translate(x,y);
  if(layer==='back'){
   const floor=()=>{
    const glow=ctx.createRadialGradient(0,8,4,0,8,83);
    glow.addColorStop(0,'rgba(229,65,24,'+(.16*strength*pulse)+')');
    glow.addColorStop(.6,'rgba(154,31,22,'+(.08*strength)+')');
    glow.addColorStop(1,'rgba(130,20,15,0)');
    ctx.fillStyle=glow;ctx.save();ctx.scale(1,.55);ctx.fillRect(-84,-76,168,168);ctx.restore();
   };
   if(ground)ground.paint(ctx,floor);else floor();
   // Estilhaços curtos de luz na ativação, sem um círculo permanente no chão.
   if(flare>0){
    ctx.globalAlpha=flare*strength*.7;
    for(let i=0;i<10;i++){
     const angle=i*2.399,r=38+age*95;
     ctx.save();ctx.translate(Math.cos(angle)*r,Math.sin(angle)*r*.7);
     ctx.rotate(angle);ctx.fillStyle=i%3?'#ef673b':'#ffd093';
     ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(5+flare*8,-2);ctx.lineTo(2,2);ctx.fill();ctx.restore();
    }
   }
  }
  for(let i=0;i<12;i++){
   if((i%3===0)!==(layer==='front'))continue;
   const phase=(age*.62+i*.173)%1;
   const xPos=Math.sin(i*13.13)*49+Math.sin(age*2+i)*4;
   const yPos=29-phase*105;
   ctx.globalAlpha=Math.sin(phase*Math.PI)*strength*(layer==='front'?.65:.45);
   ctx.fillStyle=i%3?'#ec7044':'#ffd19a';
   const size=i%4===0?3:2;ctx.fillRect(Math.round(xPos),Math.round(yPos),size,size+1);
  }
  ctx.restore();
 }
 // Corpo e sobreposição continuam separados para a espada permanecer entre as camadas.
 function heroLayer(ctx,red,normal,height,state){
  const blend=pose(state).strength;
  if(!red?.complete||!red.naturalWidth){if(normal?.naturalWidth){const w=height*normal.naturalWidth/normal.naturalHeight;ctx.drawImage(normal,-w/2,-height/2,w,height);}return;}
  if(blend<1&&normal?.complete&&normal.naturalWidth){
   const w=height*normal.naturalWidth/normal.naturalHeight;ctx.drawImage(normal,-w/2,-height/2,w,height);
  }
  ctx.save();ctx.globalAlpha*=blend;
  const w=height*red.naturalWidth/red.naturalHeight;ctx.drawImage(red,-w/2,-height/2,w,height);ctx.restore();
 }
 function projectile(ctx,p,image,ground){
  if(!image?.complete||!image.naturalWidth)return false;
  const age=p.age||0,w=164,h=w*image.naturalHeight/image.naturalWidth;
  const shadow=()=>{
   ctx.save();ctx.translate(p.x+9,p.y+22);ctx.rotate(p.angle);
   if(root.GroundShadows)root.GroundShadows.oval(ctx,0,0,48,7,.35);
   else{ctx.fillStyle='#07090f44';ctx.beginPath();ctx.ellipse(0,0,48,7,0,0,Math.PI*2);ctx.fill();}
   ctx.restore();
  };
  if(ground)ground.paint(ctx,shadow);else shadow();
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);
  // Poucas brasas por espada mantêm a leitura da rajada de doze projéteis.
  for(let i=0;i<4;i++){
   const phase=(age*3+i*.25)%1;
   ctx.globalAlpha=(1-phase)*.65*Math.min(1,age/.06);
   ctx.fillStyle=i%2?'#ef713b':'#ffbe7a';
   ctx.fillRect(Math.round(-54-phase*53),Math.round(Math.sin(i*4+age*12)*(5+phase*4)),3,2);
  }
  ctx.globalAlpha=1;ctx.shadowColor='#ed431c';ctx.shadowBlur=5+Math.sin(age*16)*1.5;
  ctx.drawImage(image,-w/2,-h/2,w,h);ctx.shadowBlur=0;
  const phase=(age*2.2)%1;
  ctx.globalAlpha=Math.sin(phase*Math.PI)*.7;ctx.fillStyle='#ffd5a0';
  ctx.fillRect(-4+phase*77,-1,5,2);
  ctx.restore();return true;
 }
 const api={pose,aura,heroLayer,projectile};root.KnightFuryVisual=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
