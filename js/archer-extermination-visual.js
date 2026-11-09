/* Flecha do Extermínio: energia de voo, sem mudar perfuração ou dano. */
((root)=>{
 'use strict';
 const clamp=n=>Math.max(0,Math.min(1,n));
 function pose(p){
  const age=Math.max(0,p.age||0);
  return {age,size:145,alpha:Number.isFinite(p.life)?clamp(p.life/.16):1,
   release:clamp(1-age/.11),glow:3.5+Math.sin(age*15)*.9};
 }
 function draw(ctx,p,image,ground){
  if(!image?.complete||!image.naturalWidth)return false;
  const view=pose(p),height=view.size*image.naturalHeight/image.naturalWidth;
  const shadow=()=>{
   ctx.save();ctx.globalAlpha*=view.alpha;
   if(root.GroundShadows)root.GroundShadows.oval(ctx,p.x+7,p.y+19,49,6,.34,p.angle);
   else{ctx.fillStyle='#070e194a';ctx.beginPath();ctx.ellipse(p.x+7,p.y+19,49,6,p.angle,0,Math.PI*2);ctx.fill();}
   ctx.restore();
  };
  if(ground)ground.paint(ctx,shadow);else shadow();
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);
  // Três filetes curtos de energia escapam da cauda, sem copiar a flecha.
  for(let i=0;i<3;i++){
   const phase=(view.age*3.3+i/3)%1,x=-52-phase*45,side=i%2?1:-1;
   const y=side*(3+phase*5)+Math.sin(view.age*11+i)*2,length=12+(1-phase)*10;
   ctx.globalAlpha=Math.sin(phase*Math.PI)*(1-phase)*view.alpha*.38;
   ctx.fillStyle=i===1?'#b6e8ff':'#5aade1';
   ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-length*.55,y+side*3,x-length,y+side);ctx.quadraticCurveTo(x-length*.4,y-side*2,x,y);ctx.fill();
  }
  for(let i=0;i<5;i++){
   const phase=(view.age*4+i/5)%1;
   ctx.globalAlpha=(1-phase)*view.alpha*.45;ctx.fillStyle=i%2?'#86cbee':'#d6f0ff';
   ctx.fillRect(Math.round(-58-phase*48),Math.round(Math.sin(i*2.399+view.age*8)*(2+phase*5)),2,2);
  }
  if(view.release>0){
   const origin=-Math.hypot(p.vx||0,p.vy||0)*view.age;
   ctx.globalAlpha=view.release*.65*view.alpha;ctx.fillStyle='#d3eeff';
   ctx.fillRect(origin-5,-1,10,2);ctx.fillRect(origin-1,-5,2,10);
  }
  ctx.globalAlpha=view.alpha;ctx.shadowColor='#73b9ef';ctx.shadowBlur=view.glow;
  ctx.drawImage(image,-view.size/2,-height/2,view.size,height);ctx.shadowBlur=0;
  ctx.globalAlpha=view.alpha*(.2+.35*Math.sin(view.age*18)**2);ctx.fillStyle='#e3f5ff';
  ctx.fillRect(53,-1,5,2);ctx.fillRect(55,-3,1,6);
  ctx.restore();return true;
 }
 const api={pose,draw};root.ArcherExterminationVisual=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
