/* Flechas Guardiãs: órbita original, profundidade e dissipação sem novos acertos. */
((root)=>{
 'use strict';
 function pose(g,index){
  const angle=g.angle+index*Math.PI*2/g.arrows.length,depth=(Math.sin(angle)+1)/2;
  const entry=Math.max(0,Math.min(1,g.elapsed/.18));
  return {x:g.x+Math.cos(angle)*g.radius,y:g.y+Math.sin(angle)*g.radius,
   angle:angle+Math.PI/4,front:Math.sin(angle)>=0,depth,
   size:88*(.98+.02*depth)*(.9+.1*(1-Math.pow(1-entry,3))),alpha:entry*(.9+.1*depth)};
 }
 function shadow(ctx,image,p,alpha,ground){
  const paint=()=>{
   ctx.save();ctx.translate(p.x,p.y);
   if(root.GroundShadows?.hovering)root.GroundShadows.hovering(ctx,image,p.size*.82,p.angle,alpha*.75);
   else{ctx.globalAlpha*=alpha*.3;ctx.fillStyle='#080d14';ctx.beginPath();ctx.ellipse(9,25,29,9,0,0,Math.PI*2);ctx.fill();}
   ctx.restore();
  };
  if(ground)ground.paint(ctx,paint);else paint();
 }
 function draw(ctx,state,image,ground,layer='all'){
  if(!image?.complete||!image.naturalWidth)return false;
  const g=state.guard,poses=g?g.arrows.filter(a=>!a.spent).map(a=>pose(g,a.index)).sort((a,b)=>a.depth-b.depth):[];
  if(layer!=='front')for(const p of poses)shadow(ctx,image,p,p.alpha,ground);
  for(const p of poses){
   if(layer==='back'&&p.front||layer==='front'&&!p.front)continue;
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=p.alpha;
   ctx.shadowColor='#b4d67c';ctx.shadowBlur=2.5+Math.sin(g.elapsed*5+p.depth)*.7;
   const h=p.size*image.naturalHeight/image.naturalWidth;ctx.drawImage(image,-p.size/2,-h/2,p.size,h);ctx.restore();
  }
  for(const e of state.effects||[]){
   const progress=Math.max(0,Math.min(1,e.age/e.duration)),fade=(1-progress)*(1-progress);
   if(layer!=='front')shadow(ctx,image,{...e,size:e.size*(1-.45*progress)},fade,ground);
   if(layer==='back'&&e.front||layer==='front'&&!e.front)continue;
   ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.globalAlpha=fade;
   const size=e.size*(1-.45*progress),height=size*image.naturalHeight/image.naturalWidth;
   if(e.age<.04)ctx.filter='brightness(1.6)';
   ctx.drawImage(image,-size/2,-height/2,size,height);ctx.filter='none';
   for(let i=0;i<7;i++){
    const angle=i*2.399,r=8+progress*(25+i%3*7),x=Math.cos(angle)*r,y=Math.sin(angle)*r-e.age*16;
    ctx.save();ctx.translate(x,y);ctx.rotate(angle+e.age*4);
    ctx.globalAlpha=Math.sin(Math.PI*Math.min(1,progress*1.4))*(1-progress)*.85;
    ctx.fillStyle=i%3?'#a5c966':'#e8dfab';
    ctx.beginPath();ctx.moveTo(0,-4);ctx.quadraticCurveTo(4,0,0,4);ctx.quadraticCurveTo(-2,0,0,-4);ctx.fill();ctx.restore();
   }
   ctx.restore();
  }
  return true;
 }
 const api={pose,draw};root.ArcherGuardVisual=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
