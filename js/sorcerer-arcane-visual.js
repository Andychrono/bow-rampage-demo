/* Selos arcanos: apresentação dos mesmos centros de colisão da órbita. */
((root)=>{
 'use strict';
 function pose(guard,index){
  const angle=guard.angle+index*Math.PI*2/guard.count,depth=(Math.sin(angle)+1)/2;
  const entry=Math.max(0,Math.min(1,guard.age/.18));
  return {x:guard.x+Math.cos(angle)*guard.radius,y:guard.y+Math.sin(angle)*guard.radius,
   angle:angle+Math.PI/2,front:Math.sin(angle)>=0,depth,
   size:guard.size*(.96+.04*depth)*(.72+.28*(1-Math.pow(1-entry,3))),
   tilt:.93+.07*Math.abs(Math.sin(angle)),alpha:entry*(.88+.12*depth)};
 }
 function shadow(ctx,image,p,opacity,ground){
  const paint=()=>{
   ctx.save();ctx.translate(p.x,p.y);
   if(root.GroundShadows?.hovering)root.GroundShadows.hovering(ctx,image,p.size,p.angle,opacity*.65);
   else{ctx.globalAlpha*=opacity*.28;ctx.fillStyle='#070a17';ctx.beginPath();ctx.ellipse(8,22,p.size*.4,p.size*.15,0,0,Math.PI*2);ctx.fill();}
   ctx.restore();
  };
  if(ground)ground.paint(ctx,paint);else paint();
 }
 function guard(ctx,e,image,ground,layer='all'){
  if(!image?.complete||!image.naturalWidth)return false;
  const g=e.guard,poses=g.arrows.filter(s=>!s.spent).map(s=>pose(g,s.index)).sort((a,b)=>a.depth-b.depth);
  if(layer!=='front')for(const p of poses)shadow(ctx,image,p,p.alpha,ground);
  for(const p of poses){
   if(layer==='back'&&p.front||layer==='front'&&!p.front)continue;
   ctx.save();ctx.globalAlpha*=p.alpha;ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.scale(1,p.tilt);
   const height=p.size*image.naturalHeight/image.naturalWidth;
   ctx.shadowColor='#b785ee';ctx.shadowBlur=2.5+Math.sin(g.age*5+p.depth)*.8;
   ctx.drawImage(image,-p.size/2,-height/2,p.size,height);ctx.shadowBlur=0;
   // Um reflexo pequeno mantém o selo vivo sem duplicar sua arte.
   ctx.globalAlpha*=.25+.2*Math.sin(g.age*7+p.depth*3)**2;
   ctx.fillStyle='#f1d7ff';ctx.fillRect(-1,-3,2,6);ctx.fillRect(-3,-1,6,2);
   ctx.restore();
  }
  return true;
 }
 function block(ctx,e,image,ground,layer='all'){
  if(!image?.complete||!image.naturalWidth)return false;
  const t=Math.max(0,Math.min(1,e.age/e.duration));
  if(layer!=='front')shadow(ctx,image,{...e,size:e.size*(1-.7*t)},(1-t)*(1-t),ground);
  if(layer==='back'&&e.front||layer==='front'&&!e.front)return true;
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.scale(1,e.tilt);
  const size=e.size*(1-.78*t),height=size*image.naturalHeight/image.naturalWidth;
  ctx.globalAlpha=(1-t)*(1-t);ctx.shadowColor='#d4a8ff';ctx.shadowBlur=8*(1-t);
  if(e.age<.045)ctx.filter='brightness(1.8)';
  ctx.drawImage(image,-size/2,-height/2,size,height);ctx.filter='none';ctx.shadowBlur=0;
  for(let i=0;i<8;i++){
   const angle=i*2.399,r=7+Math.sqrt(t)*(17+i%3*3);
   const x=Math.cos(angle)*r,y=Math.sin(angle)*r-e.age*20;
   ctx.globalAlpha=Math.sin(Math.PI*Math.min(1,t*1.4))*(1-t)*.9;
   ctx.fillStyle=i%3?'#bb83e8':'#ffe0ff';
   ctx.beginPath();ctx.moveTo(x,y-2);ctx.lineTo(x+2,y);ctx.lineTo(x,y+2);ctx.lineTo(x-2,y);ctx.closePath();ctx.fill();
  }
  ctx.restore();return true;
 }
 const api={pose,guard,block};root.SorcererArcaneVisual=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
