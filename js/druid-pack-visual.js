/* Matilha Espectral: o mesmo projétil, com sombra de voo e energia animada. */
((root)=>{
 'use strict';
 const clamp=n=>Math.max(0,Math.min(1,n));
 function pose(projectile){
  const age=Math.max(0,projectile.age||0),height=Math.sin(Math.min(1,age/.55)*Math.PI);
  const entry=clamp(age/.08),exit=Number.isFinite(projectile.life)?clamp(projectile.life/.18):1;
  return {age,lift:height*38,height,size:190*(.96+.04*entry+.035*height),
   alpha:(.4+.6*entry)*exit,glow:3.5+Math.sin(age*13)*.8};
 }
 function draw(ctx,p,image,ground){
  if(!image?.complete||!image.naturalWidth)return false;
  const view=pose(p),angle=p.angle-Math.PI/2;
  const shadow=()=>{
   ctx.save();ctx.translate(p.x-5,p.y-10);
   if(root.GroundShadows?.hovering)root.GroundShadows.hovering(ctx,image,150-8*view.height,angle,view.alpha*(.72-.18*view.height));
   else{ctx.globalAlpha*=view.alpha*(.3-.08*view.height);ctx.fillStyle='#080f19';ctx.beginPath();ctx.ellipse(12,31,55-5*view.height,14-3*view.height,0,0,Math.PI*2);ctx.fill();}
   ctx.restore();
  };
  if(ground)ground.paint(ctx,shadow);else shadow();
  ctx.save();ctx.translate(p.x,p.y-view.lift);ctx.rotate(angle);
  // Faíscas de energia na cauda: não são novos lobos nem novos acertos.
  for(let i=0;i<9;i++){
   const phase=(view.age*2.8+i/9)%1,travel=phase*53;
   const x=Math.sin(i*2.399+view.age*5)*(3+phase*8),y=-view.size*.36-travel;
   ctx.globalAlpha=Math.sin(phase*Math.PI)*(1-phase)*view.alpha*.55;
   ctx.fillStyle=i%3?'#79cbe9':'#d0f7ff';
   ctx.fillRect(Math.round(x),Math.round(y),i%3===0?3:2,3);
  }
  const width=view.size,height=width*image.naturalHeight/image.naturalWidth;
  ctx.globalAlpha=view.alpha;ctx.shadowColor='#72c7f0';ctx.shadowBlur=view.glow;
  ctx.drawImage(image,-width/2,-height/2,width,height);ctx.shadowBlur=0;
  // Reflexos pequenos atravessam a energia das patas, mantendo a anatomia intacta.
  for(const side of [-1,1]){
   const pulse=(Math.sin(view.age*17+side)+1)/2;
   ctx.globalAlpha=view.alpha*pulse*.45;ctx.fillStyle='#d7f8ff';
   ctx.fillRect(Math.round(side*width*.085)-1,Math.round(width*.34),2,3);
  }
  ctx.restore();return true;
 }
 const api={pose,draw};root.DruidPackVisual=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
