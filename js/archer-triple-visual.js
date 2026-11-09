/* Tiro Triplo: apresentação de cada flecha existente, sem criar disparos. */
((root)=>{
 'use strict';
 const clamp=n=>Math.max(0,Math.min(1,n));
 function pose(p){
  const age=Math.max(0,p.age||0);
  return {age,size:100,alpha:Number.isFinite(p.life)?clamp(p.life/.12):1,
   release:clamp(1-age/.1),glow:2.5+Math.sin(age*16)*.7};
 }
 function draw(ctx,p,image,ground){
  if(!image?.complete||!image.naturalWidth)return false;
  const view=pose(p),height=view.size*image.naturalHeight/image.naturalWidth;
  const shadow=()=>{
   ctx.save();ctx.globalAlpha*=view.alpha;
   if(root.GroundShadows)root.GroundShadows.oval(ctx,p.x+6,p.y+17,34,5,.32,p.angle);
   else{ctx.fillStyle='#080c1445';ctx.beginPath();ctx.ellipse(p.x+6,p.y+17,34,5,p.angle,0,Math.PI*2);ctx.fill();}
   ctx.restore();
  };
  if(ground)ground.paint(ctx,shadow);else shadow();
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);
  for(let i=0;i<6;i++){
   const phase=(view.age*3.8+i/6)%1,x=-36-phase*43,y=Math.sin(i*2.399+view.age*9)*(2+phase*4);
   ctx.globalAlpha=Math.sin(phase*Math.PI)*(1-phase)*view.alpha*.6;
   ctx.fillStyle=i%3?'#99c96a':'#ebdca0';ctx.fillRect(Math.round(x),Math.round(y),i%3===0?3:2,2);
  }
  if(view.release>0){
   const speed=Math.hypot(p.vx||0,p.vy||0),origin=-speed*view.age;
   ctx.globalAlpha=view.release*.55*view.alpha;ctx.fillStyle='#d9e9a5';
   ctx.fillRect(origin-2,-1,4,2);ctx.fillRect(origin,-3,1,6);
  }
  ctx.globalAlpha=view.alpha;ctx.shadowColor='#a6cf71';ctx.shadowBlur=view.glow;
  ctx.drawImage(image,-view.size/2,-height/2,view.size,height);ctx.shadowBlur=0;
  ctx.globalAlpha=view.alpha*(.15+.3*Math.sin(view.age*19)**2);ctx.fillStyle='#f1f3c1';
  ctx.fillRect(44,-1,3,2);
  ctx.restore();return true;
 }
 const api={pose,draw};root.ArcherTripleVisual=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
