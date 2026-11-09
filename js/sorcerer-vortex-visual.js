/* Vórtice Sombrio: apresentação baseada na idade do efeito, sem simular atração. */
((root)=>{
 'use strict';
 const clamp=n=>Math.max(0,Math.min(1,n));
 function pose(effect){
  const age=Math.max(0,effect.age||0),remaining=Math.max(0,effect.duration-age);
  const opening=clamp(age/.22),closing=clamp(remaining/.48);
  const entry=1-Math.pow(1-opening,3),exit=closing*closing*(3-2*closing);
  return {frame:Math.floor(age*25)%48,alpha:clamp(age/.09)*closing,
   scale:(.78+.22*entry)*(.25+.75*exit),phase:opening<1?'opening':closing<1?'closing':'active',age};
 }
 function particles(effect){
  const view=pose(effect),radius=effect.radius||140;
  return Array.from({length:14},(_,i)=>{
   const phase=(view.age*.65+i/14)%1;
   const r=radius*.94*Math.pow(1-phase,.7),angle=i*2.399-view.age*2.8-phase*1.8;
   return {x:Math.cos(angle)*r*view.scale,y:Math.sin(angle)*r*view.scale,
    alpha:Math.sin(phase*Math.PI)*view.alpha,size:i%4===0?3:2};
  });
 }
 function draw(ctx,e,frames,ground){
  const view=pose(e),image=frames[view.frame];
  if(!image?.complete||!image.naturalWidth)return false;
  const radius=e.radius||140;
  const floor=()=>{
   ctx.save();ctx.translate(e.x,e.y);
   const glow=ctx.createRadialGradient(0,0,8,0,0,radius);
   glow.addColorStop(0,'rgba(79,37,117,'+(.15*view.alpha)+')');
   glow.addColorStop(.65,'rgba(104,58,153,'+(.08*view.alpha)+')');
   glow.addColorStop(1,'rgba(80,40,110,0)');
   ctx.fillStyle=glow;ctx.fillRect(-radius,-radius,radius*2,radius*2);
   if(root.GroundShadows)root.GroundShadows.oval(ctx,7,15,radius*.76,radius*.38,.22*view.alpha*view.scale);
   ctx.restore();
  };
  if(ground)ground.paint(ctx,floor);else floor();
  // O desenho não é achatado nem recortado pela borda da plataforma.
  ctx.save();ctx.translate(e.x,e.y);
  const width=e.size*view.scale,height=width*image.naturalHeight/image.naturalWidth;
  ctx.globalAlpha=view.alpha*.9;
  ctx.drawImage(image,-width/2,-height/2,width,height);
  // Poeira e fragmentos de energia giram para dentro, em vez de saltar para fora.
  const motes=particles(e);
  for(let i=0;i<motes.length;i++){
   const p=motes[i];ctx.globalAlpha=p.alpha*(i%4===0?.65:.45);
   ctx.fillStyle=i%4===0?'#c0a3d6':'#806299';
   ctx.fillRect(Math.round(p.x),Math.round(p.y),p.size,p.size);
  }
  ctx.restore();return true;
 }
 const api={pose,particles,draw};root.SorcererVortexVisual=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
