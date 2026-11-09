/* One harmless encounter per forest run until the witch is discovered. */
((root)=>{
  'use strict';
  const SIZE=34,SPEED=570,ESCAPE_SPEED=740,CYCLE=.35,START=60,END=180,DURATION=10;
  const CROAK_INTERVAL=2.4;
  const frames=typeof Image==='undefined'?[]:Array.from({length:12},(_,i)=>{
    const img=new Image();img.src=`assets/monsters/slimes/bonus-frog/frog_frame_${String(i+1).padStart(2,'0')}.webp`;return img;
  });
  function create(){return {decided:false,scheduledAt:null,frog:null,finished:false};}
  function spawn(state,width,height,random=Math.random){
    const left=random()<.5,margin=Math.min(35,width/4);
    const x=left?margin:width-margin,y=height*(.26+random()*.48);
    state.frog={x,y,previousX:x,previousY:y,visualY:y,angle:(left?0:Math.PI)+(random()-.5)*.95,
      age:0,nextCroak:CROAK_INTERVAL,turnIn:0,curve:0,fleeing:false,width,height};
    root.BowAudio?.play('frog');
    state.decided=true;state.finished=false;return state.frog;
  }
  function step(state,dt,{time,width,height,boss=false,unlocked=false,random=Math.random}){
    if(boss||unlocked){state.frog=null;state.finished=true;return;}
    if(state.finished)return;
    if(!state.decided){
      state.scheduledAt=START+random()*(END-START);
      state.decided=true;
    }
    if(!state.frog&&time>=state.scheduledAt)spawn(state,width,height,random);
    const frog=state.frog;
    if(!frog)return;
    if(width!==frog.width||height!==frog.height){
      frog.x*=width/frog.width;frog.y*=height/frog.height;frog.visualY*=height/frog.height;
      frog.width=width;frog.height=height;
    }
    frog.previousX=frog.x;frog.previousY=frog.visualY;
    const mx=Math.min(32,width/4),my=Math.min(76,height/4);
    for(let remaining=dt;remaining>0;){
      const step=Math.min(remaining,1/120);remaining-=step;
      frog.age+=step;
      if(!frog.fleeing && frog.age>=DURATION){
        const distances=[frog.x,width-frog.x,frog.y,height-frog.y];
        const nearest=distances.indexOf(Math.min(...distances));
        frog.angle=[Math.PI,0,-Math.PI/2,Math.PI/2][nearest];
        frog.fleeing=true;
      }
      if(frog.fleeing){
        frog.x+=Math.cos(frog.angle)*ESCAPE_SPEED*step;
        frog.y+=Math.sin(frog.angle)*ESCAPE_SPEED*step;
        if(frog.x < -SIZE || frog.x > width+SIZE || frog.y < -SIZE || frog.y > height+SIZE){
          state.frog=null;state.finished=true;return;
        }
        continue;
      }
      frog.turnIn-=step;
      if(frog.turnIn<=0){
        frog.curve=(random()-.5)*5.4;
        frog.turnIn=.28+random()*.42;
      }
      frog.angle+=frog.curve*step;
      frog.x+=Math.cos(frog.angle)*SPEED*step;
      frog.y+=Math.sin(frog.angle)*SPEED*step;
      if(frog.x<mx||frog.x>width-mx){
        frog.x=Math.max(mx,Math.min(width-mx,frog.x));
        frog.angle=Math.PI-frog.angle;
      }
      if(frog.y<my||frog.y>height-my){
        frog.y=Math.max(my,Math.min(height-my,frog.y));
        frog.angle=-frog.angle;
      }
    }
    frog.visualY=frog.y-Math.sin((frog.age%CYCLE)/CYCLE*Math.PI)*15;
    if(frog.age>=frog.nextCroak && frog.x+SIZE/2>0 && frog.x-SIZE/2<width &&
      frog.visualY+SIZE/2>0 && frog.visualY-SIZE/2<height){
      root.BowAudio?.play('frog');
      frog.nextCroak=frog.age+CROAK_INTERVAL;
    }
  }
  function hit(state,from,to){
    const f=state.frog;if(!f)return false;
    const ax=from.x-f.previousX,ay=from.y-f.previousY;
    const bx=to.x-f.x,by=to.y-f.visualY,dx=bx-ax,dy=by-ay;
    const t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/(dx*dx+dy*dy||1)));
    if(Math.hypot(ax+dx*t,ay+dy*t)>18)return false;
    state.frog=null;state.finished=true;return true;
  }
  function draw(ctx,state){
    const f=state.frog;if(!f)return;
    ctx.save();
    if(root.GroundShadows)root.GroundShadows.oval(ctx,f.x,f.y+9,15,6,.46);
    else{ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(f.x,f.y+9,12,4,0,0,Math.PI*2);ctx.fill();}
    ctx.translate(f.x,f.visualY);ctx.rotate(f.angle-Math.PI/2);
    const img=frames[Math.floor((f.age%CYCLE)/CYCLE*12)];
    if(img?.complete&&img.naturalWidth)ctx.drawImage(img,-SIZE/2,-SIZE/2,SIZE,SIZE);
    else{ctx.fillStyle='#a3d75c';ctx.beginPath();ctx.ellipse(0,0,9,11,0,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
  const api={create,spawn,step,hit,draw,SIZE,SPEED,START,END,DURATION};root.FrogBonus=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
