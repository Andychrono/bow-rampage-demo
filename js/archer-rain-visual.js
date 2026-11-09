/* Chuva de Flechas: queda e impacto originais, sem escolher alvos ou causar dano. */
((root)=>{
 'use strict';
 const CONTACT=.43,clamp=n=>Math.max(0,Math.min(1,n));
 const ANCHORS=Object.freeze({5:Object.freeze([627,1192]),6:Object.freeze([627,1155]),7:Object.freeze([627,1165])});
 function pose(drop,height,projectileLength){
  const at=root.ArcherSpells.rainPosition(drop,height),age=drop.age-CONTACT;
  const lean=Math.sin(drop.x*.127+drop.y*.083)*.035;
  const frame=age<.08?5:age<.24?6:7;
  return {x:at.x,y:at.y,landed:at.landed,age,
   length:projectileLength*.8*drop.scale,frame,anchor:ANCHORS[frame],
   tilt:lean+(at.landed?Math.sin(age*42)*.028*Math.exp(-age*14):0),
   alpha:at.landed?clamp((2-drop.age)/.35):clamp(drop.age/.06),
   phase:!at.landed?'fall':age<.08?'impact':age<.24?'settle':'planted'};
 }
 function arrow(ctx,image,view,x,y,alpha,wind){
  const length=view.length,thickness=length*image.naturalHeight/image.naturalWidth;
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/2+view.tilt);ctx.globalAlpha=alpha;
  if(wind){
   ctx.fillStyle='#e1d6b4';ctx.globalAlpha=alpha*.17;
   ctx.fillRect(-length-12,-2,12,1);ctx.fillRect(-length-19,2,8,1);
  }
  ctx.globalAlpha=alpha;ctx.shadowColor='#e6dcc1';ctx.shadowBlur=2;
  ctx.drawImage(image,-length*.97,-thickness/2,length,thickness);ctx.restore();
 }
 function draw(ctx,rain,{arrow:flight,frames,projectileLength,height,ground=null}){
  if(!flight?.complete||!flight.naturalWidth)return false;
  for(const drop of rain.drops){
   if(drop.age<0||drop.age>=2)continue;
   const view=pose(drop,height,projectileLength),grounded=!ground||ground.contains(drop.x,drop.y);
   if(grounded){
    const floor=()=>{
     const progress=clamp(drop.age/CONTACT),opacity=view.alpha*(view.landed ? .18 : .04+progress*.1);
     ctx.save();ctx.translate(drop.x+8,drop.y+6);ctx.rotate(.55);
     ctx.fillStyle='#0a0e16';ctx.globalAlpha=opacity*.4;
     ctx.beginPath();ctx.ellipse(0,0,view.length*.33,3.5*drop.scale,0,0,Math.PI*2);ctx.fill();
     ctx.globalAlpha=opacity;ctx.beginPath();ctx.ellipse(0,0,view.length*.25,1.7*drop.scale,0,0,Math.PI*2);ctx.fill();ctx.restore();
    };
    if(ground)ground.paint(ctx,floor);else floor();
   }
   if(!view.landed){arrow(ctx,flight,view,view.x,view.y,view.alpha,true);continue;}
   if(!grounded){
    const fall=view.age/.3;if(fall<1)arrow(ctx,flight,view,drop.x,drop.y+fall*90,1-fall,true);
    continue;
   }
   const image=frames[view.frame];if(!image?.complete||!image.naturalWidth)continue;
   const scale=view.length/image.naturalHeight;
   ctx.save();ctx.translate(drop.x,drop.y);ctx.rotate(view.tilt);ctx.globalAlpha=view.alpha;
   // A haste permanece inteira; somente a sombra depende da máscara do chão.
   ctx.drawImage(image,-view.anchor[0]*scale,-view.anchor[1]*scale,image.naturalWidth*scale,image.naturalHeight*scale);ctx.restore();
   if(view.age<.22){
    const progress=clamp(view.age/.22),seed=drop.x*.17+drop.y*.13;
    ctx.save();ctx.globalAlpha=(1-progress)*view.alpha*.65;
    for(let i=0;i<4;i++){
     const angle=i*2.399+seed,r=4+progress*(10+i*2);
     ctx.fillStyle=i%2?'#9a8057':'#c3ad7b';
     ctx.fillRect(Math.round(drop.x+Math.cos(angle)*r),Math.round(drop.y+Math.sin(angle)*r*.45-Math.sin(progress*Math.PI)*5),2,2);
    }
    ctx.restore();
   }
  }
  return true;
 }
 const api={CONTACT,ANCHORS,pose,draw};root.ArcherRainVisual=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
