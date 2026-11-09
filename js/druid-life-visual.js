/* Ciclo da Vida: chegada dos três espíritos, sem aplicar ou medir cura. */
((root)=>{
 'use strict';
 const clamp=n=>Math.max(0,Math.min(1,n));
 const DIRECTIONS=[-2.65,-.5,1.6];
 function pose(e){
  const age=Math.max(0,e.age||0),duration=Math.max(.01,e.duration),remaining=Math.max(0,duration-age);
  return {age,duration,alpha:clamp(age/.18)*clamp(remaining/.35),progress:clamp(age/duration)};
 }
 function spirits(e){
  const view=pose(e),radius=e.size*.82;
  return DIRECTIONS.map((a,index)=>{
   const raw=(view.age-index*view.duration*.22)/(view.duration*.44);
   if(raw<=0||raw>=1)return null;
   const t=raw*raw*(3-2*raw),u=1-t,sx=Math.cos(a)*radius,sy=Math.sin(a)*radius;
   const cx=sx*.1-sy*.55,cy=sy*.1+sx*.55;
   const x=u*u*sx+2*u*t*cx,y=u*u*sy+2*u*t*cy+t*t*6;
   const dx=2*u*(cx-sx)-2*t*cx,dy=2*u*(cy-sy)+2*t*(6-cy);
   return {index,x:e.x+x,y:e.y+y,angle:Math.atan2(dy,dx)-Math.PI/4,
    size:e.size*.46*(1-.25*t),alpha:clamp(raw/.14)*clamp((1-raw)/.42)*view.alpha*.78,front:y>=8};
  }).filter(Boolean);
 }
 function draw(ctx,e,frames,ground,layer='all'){
  if(frames.length<3||frames.some(image=>!image?.complete||!image.naturalWidth))return false;
  const view=pose(e);
  if(layer!=='front'){
   const floor=()=>{
    ctx.save();ctx.translate(e.x,e.y+5);ctx.scale(1,.72);
    const radius=e.size*.52,glow=ctx.createRadialGradient(0,0,4,0,0,radius);
    glow.addColorStop(0,'rgba(152,224,170,'+(.17*view.alpha)+')');
    glow.addColorStop(.5,'rgba(135,194,110,'+(.08*view.alpha)+')');
    glow.addColorStop(1,'rgba(90,160,110,0)');ctx.fillStyle=glow;ctx.fillRect(-radius,-radius,radius*2,radius*2);ctx.restore();
   };
   if(ground)ground.paint(ctx,floor);else floor();
  }
  for(const p of spirits(e)){
   if(layer==='back'&&p.front||layer==='front'&&!p.front)continue;
   const image=frames[p.index],height=p.size*image.naturalHeight/image.naturalWidth;
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=p.alpha;
   ctx.drawImage(image,-p.size/2,-height/2,p.size,height);ctx.restore();
  }
  // Folhas discretas mantêm a leitura de cura durante todo o efeito, sem bolha de escudo.
  for(let i=0;i<8;i++){
   const front=i%3===0;if(layer==='back'&&front||layer==='front'&&!front)continue;
   const phase=(view.progress*2.2+i/8)%1;
   const x=e.x+Math.sin(i*2.399+view.age*.8)*33,y=e.y+22-phase*64;
   ctx.save();ctx.translate(x,y);ctx.rotate(i+view.age*.5);
   ctx.globalAlpha=Math.sin(phase*Math.PI)*view.alpha*(front ? .5 : .32);
   ctx.fillStyle=i%3?'#b1d79b':'#e6dca9';ctx.beginPath();ctx.moveTo(0,-3);ctx.quadraticCurveTo(3,0,0,3);ctx.quadraticCurveTo(-2,0,0,-3);ctx.fill();ctx.restore();
  }
  return true;
 }
 const api={pose,spirits,draw};root.DruidLifeVisual=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
