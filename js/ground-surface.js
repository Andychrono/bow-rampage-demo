/* A single world-space floor mask for contact effects, shadows and ground damage. */
((root)=>{
 'use strict';
 function create({enabled=()=>false,polygon=()=>[],contains=()=>true}={}){
  let world=null,path=null,signature='',points=[];
  function beginFrame(ctx){
   world=ctx.getTransform();if(!enabled())return;
   points=polygon();const key=JSON.stringify(points);
   if(key!==signature&&typeof root.Path2D==='function'){
    path=new root.Path2D();points.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));path.closePath();signature=key;
   }
  }
  function clip(ctx){
   if(!enabled())return;
   const transform=ctx.getTransform();if(!world)points=polygon();
   if(world)ctx.setTransform(world);
   if(path)ctx.clip(path);else{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();}
   ctx.setTransform(transform);
  }
  function paint(ctx,draw){ctx.save();try{clip(ctx);return draw();}finally{ctx.restore();}}
  return {beginFrame,clip,paint,contains:(x,y)=>!enabled()||contains(x,y),get enabled(){return enabled();}};
 }
 const api={create};root.GroundSurface=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
