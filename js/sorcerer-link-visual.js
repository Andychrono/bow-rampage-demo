/* Elo Elétrico: arcos e impactos visuais, sem escolher alvos ou aplicar dano. */
((root)=>{
 'use strict';
 function pose(age,duration=.65){
  const t=Math.max(0,age||0),length=Math.max(.01,duration),progress=Math.min(1,t/length);
  return {frame:Math.min(11,Math.floor(progress*12)),alpha:Math.max(0,Math.min(1,(length-t)/.24)),impactSize:78+Math.sin(progress*Math.PI)*12};
 }
 function points(length,age,index=0){
  const count=Math.max(2,Math.min(32,Math.ceil(length/23))),tick=age*24,frame=Math.floor(tick),blend=tick-frame;
  const ease=blend*blend*(3-2*blend),noise=(n,k)=>Math.sin(n*17.13+k*1.71+index*3.17);
  return Array.from({length:count+1},(_,i)=>{
   const p=i/count,envelope=Math.sin(p*Math.PI),a=noise(i,frame),b=noise(i,frame+1);
   return {x:p*length,y:i===0||i===count?0:(a+(b-a)*ease)*Math.min(13,length*.1)*envelope};
  });
 }
 function draw(ctx,e,frames){
  const view=pose(e.age,e.duration),image=frames[view.frame];
  if(!image?.complete||!image.naturalWidth)return false;
  const dx=e.x-e.fromX,dy=e.y-e.fromY,length=Math.hypot(dx,dy),index=e.linkIndex||0;
  const nodes=points(length,e.age,index),spark=.8+.2*Math.sin(e.age*31+index*1.7)**2;
  ctx.save();ctx.globalAlpha=Math.max(0,view.alpha);ctx.translate(e.fromX,e.fromY);ctx.rotate(Math.atan2(dy,dx));
  ctx.lineJoin='miter';ctx.lineCap='round';
  if(length>1){
   for(const [color,width,opacity] of [['#854ef5',8,.22],['#63bfff',3.2,.8],['#e7faff',1.1,.95]]){
    ctx.globalAlpha=Math.max(0,view.alpha)*opacity*spark;ctx.strokeStyle=color;ctx.lineWidth=width;
    ctx.beginPath();nodes.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
   }
   // Ramos pequenos dão leitura de eletricidade sem aumentar a área atingida.
   ctx.strokeStyle='#9bbcff';ctx.lineWidth=1;ctx.globalAlpha=Math.max(0,view.alpha)*.45;
   for(const fraction of [.32,.68]){
    const p=nodes[Math.floor(fraction*(nodes.length-1))],side=fraction<.5?-1:1;
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+5,p.y+side*8);ctx.lineTo(p.x+1,p.y+side*15);ctx.stroke();
   }
  }
  ctx.restore();
  // Os doze frames são impactos, nunca azulejos esticados sobre a ligação.
  ctx.save();ctx.globalAlpha=Math.max(0,view.alpha)*.9;
  const size=view.impactSize,height=size*image.naturalHeight/image.naturalWidth;
  ctx.drawImage(image,e.x-size/2,e.y-height/2,size,height);
  if(index===0&&e.age<.18){
   const size=32+e.age*80;ctx.globalAlpha*=1-e.age/.18;
   ctx.drawImage(image,e.fromX-size/2,e.fromY-size/2,size,size);
  }
  ctx.restore();return true;
 }
 const api={pose,points,draw};root.SorcererLinkVisual=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
