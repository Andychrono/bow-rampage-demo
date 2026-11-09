/* Raízes da Floresta: duas camadas originais, sem alterar dano ou imobilização. */
((root)=>{
 'use strict';
 const clamp=n=>Math.max(0,Math.min(1,n));
 function pose(effect){
  const age=Math.max(0,effect.age||0),remaining=Math.max(0,effect.duration-age),closing=clamp(remaining/.45);
  const progress=Math.min(4,age/.65*5,closing*4),frame=Math.floor(progress),mix=progress-frame;
  const active=age>=.65&&remaining>=.45;
  return {frame,next:Math.min(4,frame+1),mix,alpha:clamp(age/.09)*clamp(remaining/.22),
   phase:remaining<.45?'retract':age<.65?'grow':'active',
   upperScale:active?1+Math.sin(age*2.8)*.003:1,upperY:active?Math.sin(age*3.1)*.5:0};
 }
 function draw(ctx,e,frames,ground,layer='all'){
  const view=pose(e),indices=[view.frame,view.next,view.frame+5,view.next+5];
  if(indices.some(i=>!frames[i]?.complete||!frames[i].naturalWidth))return false;
  const upperSize=e.size*view.upperScale,split=e.y+e.size*.04;
  const blend=(offset,size,y)=>{
   const drawFrame=(frame,alpha)=>{
    if(alpha<=0)return;const image=frames[frame+offset],h=size*image.naturalHeight/image.naturalWidth;
    ctx.save();ctx.globalAlpha*=view.alpha*alpha;ctx.drawImage(image,e.x-size/2,y-h/2,size,h);ctx.restore();
   };
   drawFrame(view.frame,1-view.mix);if(view.next!==view.frame)drawFrame(view.next,view.mix);
  };
  const roots=front=>{
   ctx.save();ctx.beginPath();
   // Duas partes da mesma camada se encontram sem cortar a arte no precipício.
   if(front)ctx.rect(e.x-e.size,split,e.size*2,e.size*2);
   else ctx.rect(e.x-e.size,split-e.size*2,e.size*2,e.size*2);
   ctx.clip();blend(5,upperSize,e.y+view.upperY);ctx.restore();
  };
  if(layer!=='upper'){
   const shadow=()=>{
    ctx.save();ctx.globalAlpha=view.alpha;
    if(root.GroundShadows)root.GroundShadows.oval(ctx,e.x+4,e.y+12,e.size*.37,e.size*.13,.23);
    else{ctx.fillStyle='#080d1340';ctx.beginPath();ctx.ellipse(e.x+4,e.y+12,e.size*.37,e.size*.13,0,0,Math.PI*2);ctx.fill();}
    ctx.restore();
   };
   if(ground)ground.paint(ctx,shadow);else shadow();
   blend(0,e.size,e.y);roots(false);
  }
  if(layer!=='ground'){
   roots(true);
   ctx.save();ctx.globalAlpha=view.alpha;
   const growth=Math.min(1,e.age/.5);
   if(e.age<.5)for(let i=0;i<8;i++){
    const a=i*2.399,r=(16+growth*(28+i%3*10))*e.size/280;
    ctx.globalAlpha=(1-growth)*view.alpha*.6;ctx.fillStyle=i%2?'#8d774c':'#b1a079';
    ctx.fillRect(Math.round(e.x+Math.cos(a)*r),Math.round(e.y+Math.sin(a)*r*.55-Math.sin(growth*Math.PI)*9),2,2);
   }
   for(let i=0;i<6;i++){
    const phase=(e.age*.55+i/6)%1,a=i*2.399,r=e.size*(.15+.05*(i%3));
    ctx.globalAlpha=Math.sin(phase*Math.PI)*view.alpha*.35;ctx.fillStyle=i%2?'#a0c56f':'#c4d98b';
    ctx.fillRect(Math.round(e.x+Math.cos(a)*r),Math.round(e.y+Math.sin(a)*r*.65-phase*14),2,2);
   }
   ctx.restore();
  }
  return true;
 }
 const api={pose,draw};root.DruidRootsVisual=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
