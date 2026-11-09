/* Hold a targeted spell to preview; release validates again before committing. */
((root)=>{
 'use strict';
 function create({context,ready,cast}){
  let active=null;
  function cancel(){active=null;}
  function begin(id,source){if(!root.VocationSpells.TARGETED[id]||!ready(id))return false;active={id,source};return true;}
  function status(){if(!active)return null;const s=root.VocationSpells.targetStatus(active.id,context());return {...s,valid:ready(active.id)&&s.valid,id:active.id};}
  function release(source){if(!active||source!==active.source)return false;const id=active.id,s=status();cancel();return !!s?.valid&&cast(id,s.point);}
  function draw(ctx){
   if(!active)return;if(!ready(active.id)){cancel();return;}
   const c=context(),s=status(),color=s.valid?'#72e6a0':'#f37c79';
   ctx.save();ctx.lineWidth=1;ctx.strokeStyle='#b8cad65c';ctx.setLineDash([6,9]);
   ctx.beginPath();ctx.arc(c.x,c.y,s.range,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
   ctx.strokeStyle=color;ctx.fillStyle=s.valid?'#58ce8521':'#e9575725';ctx.lineWidth=2;
   ctx.beginPath();ctx.arc(s.point.x,s.point.y,s.radius,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.beginPath();ctx.arc(s.point.x,s.point.y,7,0,Math.PI*2);ctx.stroke();
   ctx.beginPath();ctx.moveTo(s.point.x-12,s.point.y);ctx.lineTo(s.point.x+12,s.point.y);ctx.moveTo(s.point.x,s.point.y-12);ctx.lineTo(s.point.x,s.point.y+12);ctx.stroke();
   ctx.restore();
  }
  return {begin,release,cancel,status,draw,get active(){return active;}};
 }
 const api={create};root.SpellAim=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
