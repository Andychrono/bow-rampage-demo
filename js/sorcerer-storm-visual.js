/* Chuva de Raios: os mesmos impactos, com âncora por frame e descida visual. */
((root)=>{
 'use strict';
 // Ponto de contato em cada canvas original de 1254 x 1254.
 const ANCHORS=Object.freeze([[627,999],[640,1135],[627,1148],[630,1122],[638,1161],[635,1111],[627,1061],[640,1019],[627,961],[627,748]].map(Object.freeze));
 const CONTACT=.32;
 const ENDS=[.1,.22,.32,.40,.49,.58,.66,.74,.82,.9];
 const clamp=n=>Math.max(0,Math.min(1,n));
 function pose(age){
  const t=Math.max(0,age||0),next=ENDS.findIndex(end=>t<end),frame=next<0?9:next;
  const contact=t>=CONTACT;
  return {frame,anchor:ANCHORS[frame],phase:t<.1?'gather':contact?t<.58?'impact':'release':'fall',
   alpha:t>=.9?0:t<.1?.35+.65*t/.1:clamp((.9-t)/.17),
   fall:clamp((t-.1)/(.32-.1)),contact,flash:contact?clamp(1-(t-CONTACT)/.12):0};
 }
 function drawPart(ctx,image,left,top,scale,sourceY,sourceHeight,opacity=1){
  if(sourceHeight<=0)return;
  ctx.save();ctx.globalAlpha*=opacity;
  ctx.drawImage(image,0,sourceY,image.naturalWidth,sourceHeight,left,top+sourceY*scale,image.naturalWidth*scale,sourceHeight*scale);ctx.restore();
 }
 function draw(ctx,e,frames,ground){
  const view=pose(e.age),image=frames[view.frame];
  if(!image?.complete||!image.naturalWidth)return false;
  const scale=e.size/image.naturalWidth,left=e.x-view.anchor[0]*scale,top=e.y-view.anchor[1]*scale-(view.phase==='gather'?e.size*.3:0);
  const grounded=!ground||ground.contains(e.x,e.y),strength=e.ambient ? .72 : 1;
  const floor=()=>{
   ctx.save();ctx.translate(e.x,e.y);
   const age=Math.max(0,e.age-CONTACT),radius=(view.contact?35+clamp(age/.2)*29:17)*e.size/300;
   const light=ctx.createRadialGradient(0,0,0,0,0,radius);
   const alpha=view.contact?view.alpha*(.12+view.flash*.25):view.alpha*.07;
   light.addColorStop(0,'rgba(190,218,255,'+(alpha*strength)+')');
   light.addColorStop(.45,'rgba(130,93,231,'+(alpha*.6*strength)+')');
   light.addColorStop(1,'rgba(76,60,170,0)');
   ctx.fillStyle=light;ctx.save();ctx.scale(1,.6);ctx.fillRect(-radius,-radius,radius*2,radius*2);ctx.restore();ctx.restore();
  };
  if(grounded){if(ground)ground.paint(ctx,floor);else floor();}
  ctx.save();ctx.globalAlpha=view.alpha*strength;
  if(view.phase==='gather'){
   // A descarga começa no alto; a explosão deste frame fica oculta até o contato.
   drawPart(ctx,image,left,top,scale,0,780);
  }else if(view.phase==='fall'){
   const revealed=Math.max(1,Math.min(image.naturalHeight,view.anchor[1]-(1-view.fall)**2*image.naturalWidth*.7));
   const fade=Math.min(90,revealed),solid=revealed-fade;
   drawPart(ctx,image,left,top,scale,0,solid);
   for(let i=0;i<6;i++)drawPart(ctx,image,left,top,scale,solid+i*fade/6,fade/6,1-(i+.5)/6);
  }else if(grounded){
   ctx.drawImage(image,left,top,image.naturalWidth*scale,image.naturalHeight*scale);
  }else{
   // No precipício há descarga no ar, sem explosão apoiada em chão inexistente.
   const end=Math.max(1,view.anchor[1]-100),fade=Math.min(140,end),solid=end-fade;
   drawPart(ctx,image,left,top,scale,0,solid);
   for(let i=0;i<5;i++)drawPart(ctx,image,left,top,scale,solid+i*fade/5,fade/5,1-(i+.5)/5);
  }
  ctx.restore();
  if(grounded&&view.contact&&e.age<.72){
   const p=clamp((e.age-CONTACT)/.4),seed=(e.x*.13+e.y*.17)%6.28;
   ctx.save();ctx.globalAlpha=(1-p)*strength*.7;
   for(let i=0;i<6;i++){
    const angle=i*2.399+seed,travel=9+p*(24+i%3*5),size=i%3===0?3:2;
    ctx.fillStyle=i%2?'#b59af0':'#d7efff';
    ctx.fillRect(Math.round(e.x+Math.cos(angle)*travel),Math.round(e.y+Math.sin(angle)*travel*.5-Math.sin(p*Math.PI)*11),size,size);
   }
   ctx.restore();
  }
  return true;
 }
 const api={ANCHORS,CONTACT,pose,draw};root.SorcererStormVisual=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
