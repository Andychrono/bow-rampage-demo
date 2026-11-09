/* Apresentação da Espada Perfurante. Não altera projéteis nem colisões. */
((root)=>{
 'use strict';
 function pose(age){
  const t=Math.max(0,age||0),entry=Math.min(1,t/.12);
  return {size:158,alpha:.55+.45*entry,glow:4+Math.sin(t*19)*1.2,trail:Math.min(1,t/.09)};
 }
 function draw(ctx,p,image,ground){
  if(!image?.complete||!image.naturalWidth)return false;
  const t=p.age||0,view=pose(t),w=view.size,h=w*image.naturalHeight/image.naturalWidth;
  const paint=fn=>ground?ground.paint(ctx,fn):fn();
  paint(()=>{
   ctx.save();ctx.translate(p.x+8,p.y+22);ctx.rotate(p.angle);
   if(root.GroundShadows)root.GroundShadows.oval(ctx,0,0,62,9,.36);
   else{ctx.fillStyle='#050b1640';ctx.beginPath();ctx.ellipse(0,0,62,9,0,0,Math.PI*2);ctx.fill();}
   ctx.restore();
  });
  // O rastro fica no ar, sem ser recortado pela borda da plataforma.
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);
  ctx.globalAlpha=view.alpha;
  for(let i=0;i<8;i++){
   const phase=(t*3.2+i/8)%1,side=i%2?1:-1;
   const x=-46-phase*79,y=side*(4+phase*10)+Math.sin(t*21+i*2)*2;
   ctx.globalAlpha=view.alpha*view.trail*(1-phase)*.65;
   ctx.fillStyle=i%3?'#72c7f3':'#e0f5ff';
   const size=phase<.45?2:1;ctx.fillRect(Math.round(x),Math.round(y),size*2,size);
  }
  ctx.globalAlpha=view.alpha;
  ctx.shadowColor='#6ab9ef';ctx.shadowBlur=view.glow;
  ctx.drawImage(image,-w/2,-h/2,w,h);
  ctx.shadowBlur=0;
  // Reflexos pequenos percorrem a lâmina; a imagem não fica congelada no voo.
  for(let i=0;i<2;i++){
   const travel=(t*2.4+i*.5)%1,x=-7+travel*73;
   ctx.globalAlpha=Math.sin(travel*Math.PI)*.65;
   ctx.fillStyle='#e0f6ff';ctx.fillRect(x-2,-1,4,2);ctx.fillRect(x,-3,1,6);
  }
  ctx.restore();return true;
 }
 const api={draw,pose};root.KnightPiercingVisual=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
