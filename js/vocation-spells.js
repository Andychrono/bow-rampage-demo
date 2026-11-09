/* Spells das outras vocações. Dano usa os projéteis e as regras comuns de combate. */
((root)=>{
 'use strict';
 const base='assets/projectiles/';
 const sequence=(folder,n,file)=>Array.from({length:n},(_,i)=>base+folder+'/'+file(i));
 const ART={
  piercing_sword:[base+'knight/piercing-sword.webp'],
  royal_protection:[base+'knight/royal-protection.webp'],
  royal_impact:sequence('knight/royal-impact',15,i=>`royal_impact_${String(i+1).padStart(2,'0')}.webp`),
  fury:[base+'knight/berserk/berserk-sword.webp'],
  fury_body:sequence('knight/berserk/body-layer',8,i=>`berserk_${String(i+1).padStart(2,'0')}.webp`),
  fury_overlay:sequence('knight/berserk/hair-layer',8,i=>`berserk_${String(i+1).padStart(2,'0')}.webp`),
  arcane_protection:[base+'sorcerer/arcane-shield.webp'],
  electric_link:sequence('sorcerer/electric-link',12,i=>`electric_link_frame_${String(i+1).padStart(2,'0')}.webp`),
  dark_vortex:sequence('sorcerer/dark-vortex',48,i=>`frame_${String(i).padStart(2,'0')}_delay-0.04s.webp`),
  lightning_rain:sequence('sorcerer/lightning-rain',10,i=>`frame_${String(i+1).padStart(2,'0')}.webp`),
  spectral_pack:[base+'druid/spectral-pack.webp'],
  forest_roots:sequence('druid/forest-roots',10,i=>`${i+1}.webp`),
  life_cycle:sequence('druid/life-cycle',3,i=>`life_cycle_${i+1}.webp`),
  ancestral_spirit:[base+'druid/ancestral-spirit.webp']
 };
 // Âncora do contato com o solo em cada canvas original de 512 x 512.
 const IMPACT_ANCHORS=[[239,404],[239,404],[239,404],[239,404],[234,416],[238,409],[226,393],[243,369],[255,278],[263,278],[267,279],[263,274],[263,274],[263,274],[263,274]];
 // Contact remains at .5 seconds; only the presentation is retimed.
 const IMPACT_TIMING=Object.freeze({prepare:.28,contact:.5,settle:.82,release:1.45,duration:2.2});
 function impactPose(age){
  const t=Math.max(0,age),timing=IMPACT_TIMING;
  if(t<timing.prepare)return {phase:'prepare',frame:0,lift:0,alpha:.2+.6*(t/timing.prepare)};
  if(t<timing.contact){const p=(t-timing.prepare)/(timing.contact-timing.prepare);return {phase:'fall',frame:p<.45?2:3,lift:185*(1-p*p),alpha:1};}
  if(t<timing.settle)return {phase:'impact',frame:Math.min(7,4+Math.floor((t-timing.contact)/(timing.settle-timing.contact)*4)),lift:0,alpha:1};
  // These three landed frames share the planted blade, but animate the energy and debris.
  if(t<timing.release){const frames=[8,9,10,9];return {phase:'hold',frame:frames[Math.floor((t-timing.settle)*8)%frames.length],lift:0,alpha:1};}
  const p=Math.min(1,(t-timing.release)/(timing.duration-timing.release));
  return {phase:'release',frame:Math.min(14,9+Math.floor(p*6)),lift:0,alpha:(1-p)*(1-p)};
 }
 function drawRoyalImpact(ctx,e,img,pose,ground){
  const k=e.size/440,t=e.age,timing=IMPACT_TIMING;
  const groundDraw=paint=>ground?ground.paint(ctx,paint):paint();
  // Floor light and debris obey the floor mask; the upright blade can overhang it.
  groundDraw(()=>{
   const contact=t>=timing.contact,age=t-timing.contact;
   const fade=pose.phase==='release'?pose.alpha:1;
   ctx.save();ctx.globalAlpha=fade;
   const radius=(contact?60:28+16*Math.min(1,t/timing.contact))*k;
   const glow=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,radius);
   glow.addColorStop(0,contact?'rgba(106,191,255,.25)':'rgba(118,178,239,.12)');
   glow.addColorStop(1,'rgba(40,113,211,0)');
   ctx.fillStyle=glow;ctx.fillRect(e.x-radius,e.y-radius,radius*2,radius*2);
   ctx.fillStyle=contact?'rgba(5,13,23,.2)':'rgba(5,13,23,.1)';
   ctx.beginPath();ctx.ellipse(e.x,e.y+5*k,(contact?44:17)*k,(contact?13:5)*k,0,0,Math.PI*2);ctx.fill();
   if(age>=0&&age<.42){
    const p=age/.42;ctx.globalAlpha=(1-p)*.65;
    for(let i=0;i<10;i++){
     const a=i*2.399,travel=(12+p*(45+i%3*9))*k;
     const px=e.x+Math.cos(a)*travel,py=e.y+Math.sin(a)*travel*.45;
     ctx.fillStyle=i%3===0?'#c4b18a':i%2?'#738293':'#a4b4c4';
     const size=(i%3+2)*k;ctx.fillRect(Math.round(px),Math.round(py),size,size);
    }
   }
   ctx.restore();
  });
  ctx.save();ctx.globalAlpha=pose.alpha;
  if(pose.phase==='prepare'){
   const size=e.size*(.42+.12*Math.min(1,t/timing.prepare)),scale=size/img.naturalWidth;
   // Frame 1's star is at (250,374), distinct from the blade-contact anchors.
   ctx.drawImage(img,e.x-250*scale,e.y-374*scale,size,img.naturalHeight*scale);
  }else{
   const scale=e.size/img.naturalWidth,anchor=IMPACT_ANCHORS[pose.frame];
   ctx.drawImage(img,e.x-anchor[0]*scale,e.y-anchor[1]*scale-pose.lift*k,e.size,img.naturalHeight*scale);
  }
  ctx.restore();
 }
 const RANGES={royal_impact:560,forest_roots:480,dark_vortex:520,electric_link:760};
 function royalGuardPose(guard,index){
  const angle=guard.angle+index*Math.PI*2/guard.count,depth=(Math.sin(angle)+1)/2;
  const entry=Math.min(1,guard.age/.18);
  return {x:guard.x+Math.cos(angle)*guard.radius,y:guard.y+Math.sin(angle)*guard.radius,
   angle:angle+Math.PI/2+Math.sin(angle)*.12,front:Math.sin(angle)>=0,depth,
   size:guard.size*(.94+.06*depth)*(.84+.16*(1-Math.pow(1-entry,3))),
   tilt:.92+.08*Math.abs(Math.sin(angle)),alpha:entry*(.86+.14*depth)};
 }
 function royalShieldShadow(ctx,img,x,y,size,angle,opacity){
  ctx.save();ctx.translate(x,y);
  if(root.GroundShadows?.hovering)root.GroundShadows.hovering(ctx,img,size,angle,opacity);
  else{ctx.globalAlpha*=opacity;ctx.fillStyle='rgba(3,8,15,.43)';ctx.beginPath();ctx.ellipse(12,36,size*.44,size*.17,0,0,Math.PI*2);ctx.fill();}
  ctx.restore();
 }
 function drawRoyalGuard(ctx,e,img,ground,layer){
  const poses=e.guard.arrows.filter(s=>!s.spent).map(s=>royalGuardPose(e.guard,s.index)).sort((a,b)=>a.depth-b.depth);
  if(layer!=='front')for(const p of poses){
   const shadow=()=>royalShieldShadow(ctx,img,p.x,p.y,p.size,p.angle,p.alpha);
   if(ground)ground.paint(ctx,shadow);else shadow();
  }
  for(const p of poses){
   if(layer==='back'&&p.front||layer==='front'&&!p.front)continue;
   ctx.save();ctx.globalAlpha*=p.alpha;ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.scale(1,p.tilt);
   ctx.shadowColor='#83c7fa';ctx.shadowBlur=2+Math.sin(e.guard.age*3+p.depth)*.5;
   const h=p.size*img.naturalHeight/img.naturalWidth;ctx.drawImage(img,-p.size/2,-h/2,p.size,h);ctx.restore();
  }
 }
 function drawRoyalBlock(ctx,e,img,ground){
  const p=Math.min(1,e.age/e.duration),fade=(1-p)*(1-p),size=e.size,h=size*img.naturalHeight/img.naturalWidth;
  const shadow=()=>royalShieldShadow(ctx,img,e.x,e.y,size,e.angle,fade);
  if(ground)ground.paint(ctx,shadow);else shadow();
  ctx.save();ctx.globalAlpha=fade;ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.scale(1,e.tilt);
  if(e.age<.055){ctx.filter='brightness(2.4)';ctx.drawImage(img,-size/2,-h/2,size,h);}
  else{
   // Four pieces of the existing shield separate briefly, without creating new artwork.
   const spread=10*Math.pow(p,.65);
   for(const sx of [-1,1])for(const sy of [-1,1]){
    ctx.save();ctx.translate(sx*spread,sy*spread);ctx.beginPath();ctx.rect(sx<0?-size/2:0,sy<0?-h/2:0,size/2,h/2);ctx.clip();ctx.drawImage(img,-size/2,-h/2,size,h);ctx.restore();
   }
  }
  ctx.filter='none';
  for(let i=0;i<6;i++){const a=i*Math.PI/3+.2,r=12+p*32;ctx.fillStyle=i%2?'#9ed8ff':'#edd29a';const s=2+(i%2);ctx.fillRect(Math.cos(a)*r,Math.sin(a)*r*.8,s,s);}
  ctx.restore();
 }
 const TARGETED={royal_impact:{radius:210,grounded:true},forest_roots:{radius:130,grounded:true},dark_vortex:{radius:140,grounded:true}};
 function targetStatus(id,{x,y,aimX,aimY,width=x*2,height=y*2,ground=null,talents={}}){
  const def=TARGETED[id],point={x:aimX,y:aimY};if(!def)return {valid:true,point};
  const inView=Number.isFinite(aimX)&&Number.isFinite(aimY)&&aimX>=0&&aimY>=0&&aimX<=width&&aimY<=height;
  const inRange=inView&&Math.hypot(aimX-x,aimY-y)<=RANGES[id]+1e-6;
  const onGround=!def.grounded||!ground||ground.contains(aimX,aimY);
  return {valid:inRange&&onGround,point,range:RANGES[id],radius:talents[id]?.radius??def.radius,reason:!inRange?'range':!onGround?'ground':null};
 }
 function targetPoint(id,{x,y,aimX,aimY,width,height}){const ax=Math.max(16,Math.min(width-16,aimX)),ay=Math.max(16,Math.min(height-16,aimY)),dx=ax-x,dy=ay-y,d=Math.hypot(dx,dy),range=RANGES[id]??Infinity,f=Math.min(1,range/(d||1));return {x:x+dx*f,y:y+dy*f};}
 const DEFINITIONS={
  Knight:[['piercing_sword',14,2.5],['royal_protection',26,0],['royal_impact',22,2.8],['fury',75,0]],
  Sorcerer:[['electric_link',14,1.6],['dark_vortex',26,.35],['arcane_protection',28,0],['lightning_rain',85,5]],
  Druid:[['spectral_pack',16,1.2],['forest_roots',24,.5],['life_cycle',60,0],['ancestral_spirit',80,.9]]
 };
 const CATALOG=Object.fromEntries(Object.entries(DEFINITIONS).map(([voc,list])=>[voc,list.map(([id,cooldown,power],i)=>({id,cooldown,power,key:'QWER'[i],available:!!ART[id],art:ART[id]?.[0]}))]));
 const cache={};
 function images(id){if(typeof Image==='undefined')return [];return cache[id]||(cache[id]=(ART[id]||[]).map(src=>{const img=new Image();img.src=src;return img;}));}
 function demonicVolley({x,y,angle,speed,pierce=0,extraShot=0}){const shots=[];for(let i=0;i<12;i++)for(const spread of extraShot?[-.1,.1]:[0]){const a=angle+i*Math.PI/6+spread;shots.push({x:x+Math.cos(a)*45,y:y+Math.sin(a)*45,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,angle:a,voc:'Knight',life:3,trail:[],berserk:true,pierceLeft:pierce});}return shots;}
 function create(vocation,emit,random=Math.random,talents={}){
  const catalog=CATALOG[vocation]||[];let times={},effects=[],guard=null,fury=0,healing=0,furyAge=0,devCooldown=null,storm=null,followUp=null;
  const cooldown=s=>devCooldown??talents[s.id]?.cooldown??s.cooldown;
  const stormDuration=talents.lightning_rain?.duration??5;
  const healingDuration=talents.life_cycle?.duration??3;
  function reset(){times=Object.fromEntries(catalog.map(s=>[s.id,0]));effects=[];guard=null;storm=null;followUp=null;fury=healing=furyAge=0;}
  function projectile(id,x,y,angle=0,speed=0,extra={}){const s=catalog.find(s=>s.id===id);emit({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,angle,voc:vocation,life:2,trail:[],spellId:id,spellPower:s.power,pierceLeft:0,...extra});}
  function pulse(id,x,y,radius,extra={}){projectile(id,x,y,0,0,{areaImpact:true,impactRadius:radius,invisible:true,transient:true,life:1,...extra});}
  function visual(id,x,y,duration,size,extra={}){effects.push({id,x,y,age:0,duration,size,tick:0,...extra});images(id);}
  function cast(id,{x,y,aimX,aimY,width=x*2,height=y*2,monsters=[],allowed=true,ground=null}){
   const s=catalog.find(s=>s.id===id),protective=id==='royal_protection'||id==='arcane_protection';if(!allowed||!s?.available||times[id]>0||(protective&&guard&&devCooldown===null))return false;
   if(!targetStatus(id,{x,y,aimX,aimY,width,height,ground}).valid)return false;
   if(!protective||devCooldown!==null)times[id]=cooldown(s);
   if(protective&&guard){for(const sword of guard.arrows)sword.spent=true;effects=effects.filter(e=>!e.guard);}const a=Math.atan2(aimY-y,aimX-x),point=TARGETED[id]?{x:aimX,y:aimY}:targetPoint(id,{x,y,aimX,aimY,width,height}),tx=point.x,ty=point.y;
   if(id==='piercing_sword'){
    const px=x+Math.cos(a)*45,py=y+Math.sin(a)*45,extra={pierceAll:true,life:Math.hypot(width,height)/700+1};
    projectile(id,px,py,a,700,extra);
    if(talents[id]?.extra)followUp={remaining:.14,fire:()=>projectile(id,px,py,a,700,{...extra,spellPower:s.power*.6})};
   }
   if(protective){const arcane=id==='arcane_protection',count=talents[id]?.count??(arcane?5:3);guard={id,x,y,age:0,angle:0,count,radius:arcane?80:90,speed:arcane?4.8:1.5,size:arcane?50:78,arrows:Array.from({length:count},(_,index)=>({index,spent:false}))};visual(id,x,y,Infinity,150,{follow:true,guard});}
   if(id==='royal_impact'){const radius=talents[id]?.radius??TARGETED[id].radius;visual(id,tx,ty,IMPACT_TIMING.duration,440*radius/TARGETED[id].radius,{radius,oneShot:true,fps:8,impactAt:IMPACT_TIMING.contact,anchor:Object.freeze({x:tx,y:ty})});}
   if(id==='fury'){fury=talents[id]?.duration??7;furyAge=0;images('fury_body');images('fury_overlay');}
   if(id==='electric_link'){
    let pool=monsters.filter(m=>m.hp>0&&!m.isRetreating&&Math.hypot(m.x-x,m.y-y)<=RANGES.electric_link&&m.x>=0&&m.x<=width&&m.y>=0&&m.y<=height),px=aimX,py=aimY,origin={x,y};
    if(!pool.length){times[id]=0;return false;}
    for(let i=0;i<(talents[id]?.count??4)&&pool.length;i++){
     pool.sort((a,b)=>Math.hypot(a.x-px,a.y-py)-Math.hypot(b.x-px,b.y-py));const m=pool.shift();if(i&&Math.hypot(m.x-origin.x,m.y-origin.y)>260)break;
     pulse(id,m.x,m.y,12,{onlyTarget:m,hitsAir:true,spellPower:s.power*Math.pow(.85,i)});visual(id,m.x,m.y,.65,90,{fromX:origin.x,fromY:origin.y,linkIndex:i,linkSource:i?origin:null,linkTarget:m});origin=m;px=m.x;py=m.y;
    }
   }
   if(id==='dark_vortex'){const radius=talents[id]?.radius??TARGETED[id].radius;visual(id,tx,ty,talents[id]?.duration??6,290*radius/TARGETED[id].radius,{field:true,radius});}
   if(id==='lightning_rain')storm={elapsed:0,next:new WeakMap(),ambientNext:0,ambientWave:0};
   if(id==='spectral_pack'){
    const extra={pierceAll:true,life:Math.hypot(width,height)/580+1,hitRadius:26,leap:true,age:0};
    projectile(id,x+Math.cos(a)*50,y+Math.sin(a)*50,a,580,extra);
    if(talents[id]?.extra){const angle=a+.16;projectile(id,x+Math.cos(angle)*50,y+Math.sin(angle)*50,angle,580,{...extra,spellPower:s.power*.6});}
   }
   if(id==='forest_roots'){const radius=talents[id]?.radius??TARGETED[id].radius;visual(id,tx,ty,3,280*radius/TARGETED[id].radius,{roots:true,radius,caught:new Set()});}
   if(id==='life_cycle'){healing=healingDuration;visual(id,x,y,healingDuration,160,{follow:true,healing:true});}
   
   if(id==='ancestral_spirit')visual(id,x,y,4,Math.min(560,width*.85,height*.5),{follow:true,mark:true,field:true,radius:Math.hypot(width,height)/2+32,burstAt:1.6});
   root.BowAudio?.spell(id);
   return true;
  }
  function update(dt,{x,y,active=true,monsters=[],targets=monsters,width=x*2,height=y*2,heal=()=>{},ground=null}){
   if(!active||!Number.isFinite(dt)||dt<=0)return;
   if(followUp&&(followUp.remaining-=dt)<=0){followUp.fire();followUp=null;}
   for(const s of catalog)times[s.id]=Math.max(0,times[s.id]-dt);
   if(fury>0)furyAge+=dt;fury=Math.max(0,fury-dt);
   if(guard){const previous=guard.angle;guard.x=x;guard.y=y;guard.age+=dt;guard.angle+=dt*guard.speed;for(const sword of guard.arrows){if(sword.spent)continue;const a=guard.angle+sword.index*Math.PI*2/guard.count,old=previous+sword.index*Math.PI*2/guard.count;projectile(guard.id,x+Math.cos(a)*guard.radius,y+Math.sin(a)*guard.radius,a,0,{fromX:x+Math.cos(old)*guard.radius,fromY:y+Math.sin(old)*guard.radius,life:dt+.1,invisible:true,transient:true,royalSword:sword,hitRadius:26});}}
   if(healing>0){heal(Math.min(dt,healing)/healingDuration);healing=Math.max(0,healing-dt);}
   if(storm){
    const previous=storm.elapsed;storm.elapsed+=dt;
    while(storm.ambientNext<=storm.elapsed+1e-9&&storm.ambientNext<stormDuration){
     for(let i=0;i<2;i++){const cell=(storm.ambientWave*2+i)%12;visual('lightning_rain',(cell%4+.12+random()*.76)*width/4,(Math.floor(cell/4)+.12+random()*.76)*height/3,.9,300,{strike:true,ambient:true,oneShot:true,fps:12,age:Math.max(0,storm.elapsed-storm.ambientNext)-dt});}
     storm.ambientWave++;storm.ambientNext+=.2;
    }
    if(previous<stormDuration)for(const target of targets){
     if(target.hp<=0||target.x<0||target.x>width||target.y<0||target.y>height)continue;
     let next=storm.next.get(target)??previous;
     while(next<=storm.elapsed+1e-9&&next<stormDuration){visual('lightning_rain',target.x,target.y,.9,300,{strike:true,oneShot:true,fps:12,age:Math.max(0,storm.elapsed-next)-dt});next+=1.1;}
     storm.next.set(target,next);
    }
    if(storm.elapsed>=stormDuration)storm=null;
   }
   for(const e of effects){
    if(e.id==='electric_link'){e.fromX=e.linkSource?.x??x;e.fromY=e.linkSource?.y??y;e.x=e.linkTarget.x;e.y=e.linkTarget.y;}
    const before=e.age;e.age+=dt;if(e.mark)e.radius=Math.hypot(width,height)/2+32;if(e.anchor){e.x=e.anchor.x;e.y=e.anchor.y;}else if(e.follow){e.x=x;e.y=y;}
    if(e.delay){e.delay-=dt;if(e.delay>0){e.age=0;continue;}e.age=Math.max(0,-e.delay);e.delay=0;if(e.target?.hp>0){e.x=e.target.x;e.y=e.target.y;}}
    if(e.impactAt!==undefined&&!e.impacted&&e.age>=e.impactAt){e.impacted=true;e.groundContact=!ground||ground.contains(e.x,e.y);if(e.groundContact){root.BowAudio?.play('royal_impact');pulse(e.id,e.x,e.y,e.radius,{rootDuration:.6,spellKnock:38,groundOnly:true});}}
    if(e.roots&&e.age>=.35&&e.age<e.duration){for(const m of monsters)if(m.hp>0&&(!ground||ground.contains(m.x,m.y))&&!e.caught.has(m)&&Math.hypot(m.x-e.x,m.y-e.y)<=e.radius+(m.radius||20)){e.caught.add(m);pulse(e.id,m.x,m.y,12,{onlyTarget:m,rootDuration:3,groundOnly:true});}}
    if(e.strike&&!e.struck&&e.age>=.32){e.struck=true;root.BowAudio?.play('lightning');pulse(e.id,e.x,e.y,110,{hitsAir:true,ambient:!!e.ambient,spellPower:e.ambient?1.5:5});}
    if(e.mark&&!e.burst&&e.age>=e.burstAt){e.burst=true;pulse(e.id,e.x,e.y,e.radius,{spellPower:8,evaporate:true,hitsAir:true,screenOnly:true});}
    if(e.field&&(!e.mark||e.burst)){
     e.tick-=dt;while(e.tick<=0&&before<e.duration){pulse(e.id,e.x,e.y,e.radius,e.mark?{spellPower:1.2,evaporate:true,hitsAir:true,screenOnly:true}:{});e.tick+=.5;}
     if(!e.mark)for(const m of monsters)if(m.hp>0&&!m.isRetreating){const dx=e.x-m.x,dy=e.y-m.y,d=Math.hypot(dx,dy);if(d>12&&d<e.radius){m.vortexTimer=.15;const pull=Math.min((110+140*(1-d/e.radius))*dt,d-12);m.x+=dx/d*pull;m.y+=dy/d*pull;}}
    }
   }
   effects=effects.filter(e=>e.delay>0||e.age<e.duration&&(!e.guard||e.guard.arrows.some(a=>!a.spent)));
  }
  function draw(ctx,ground,layer='all'){for(const e of effects){if(e.delay>0)continue;
   if(layer==='ground'){if(e.roots&&root.DruidRootsVisual)root.DruidRootsVisual.draw(ctx,e,images(e.id),ground,'ground');continue;}
   const royal=e.guard?.id==='royal_protection'||e.guardBreak;
   const arcane=!!root.SorcererArcaneVisual&&(e.guard?.id==='arcane_protection'||e.arcaneBreak);
   const life=!!root.DruidLifeVisual&&e.healing;
   if(layer==='front'&&!royal&&!arcane&&!life)continue;
   if(e.guardBreak&&(layer==='back'&&e.front||layer==='front'&&!e.front))continue;
   if(e.id==='electric_link'&&root.SorcererLinkVisual?.draw(ctx,e,images(e.id)))continue;
   if(e.id==='dark_vortex'&&root.SorcererVortexVisual?.draw(ctx,e,images(e.id),ground))continue;
   if(e.id==='lightning_rain'&&root.SorcererStormVisual?.draw(ctx,e,images(e.id),ground))continue;
   if(e.roots&&root.DruidRootsVisual?.draw(ctx,e,images(e.id),ground,'upper'))continue;
   if(life&&root.DruidLifeVisual.draw(ctx,e,images(e.id),ground,layer))continue;
   if(arcane){const image=images('arcane_protection')[0];if(e.arcaneBreak?root.SorcererArcaneVisual.block(ctx,e,image,ground,layer):root.SorcererArcaneVisual.guard(ctx,e,image,ground,layer))continue;}
   const list=images(e.id),pose=e.id==='royal_impact'?impactPose(e.age):null,img=list[pose?pose.frame:Math.min(list.length-1,e.oneShot?Math.floor(e.age*e.fps):e.roots?Math.min(4,Math.floor(e.age/.65*5)):Math.floor(e.age*20)%list.length)];if(!img?.complete||!img.naturalWidth)continue;
   ctx.save();ctx.globalAlpha=Math.min(1,e.age/.08,(e.duration-e.age)/.2);
   if(e.guardBreak){drawRoyalBlock(ctx,e,img,ground);ctx.restore();continue;}
   if(e.guard?.id==='royal_protection'){drawRoyalGuard(ctx,e,img,ground,layer);ctx.restore();continue;}
   if(e.roots){const shadow=()=>{ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(e.x,e.y+12,e.size*.32,e.size*.10,0,0,Math.PI*2);ctx.fill();};if(ground)ground.paint(ctx,shadow);else shadow();}
   if(e.roots){const frame=Math.min(4,Math.floor(e.age/.65*5)),lower=list[frame],upper=list[frame+5];for(const layer of [lower,upper]){if(!layer?.complete||!layer.naturalWidth)continue;const h=e.size*layer.naturalHeight/layer.naturalWidth;ctx.drawImage(layer,e.x-e.size/2,e.y-h/2,e.size,h);}ctx.restore();continue;}
   if(e.mark){
    const growth=Math.min(1,e.age/e.burstAt),scale=.08+.92*(1-Math.pow(1-growth,3)),size=e.size*scale,foot=e.y,fade=Math.max(0,Math.min(1,(e.duration-e.age)/.65));
    ctx.globalAlpha=fade*growth;const glow=ctx.createRadialGradient(e.x,foot,0,e.x,foot,e.radius*(.3+.7*growth));glow.addColorStop(0,'rgba(255,241,174,'+(.2+.35*growth)+')');glow.addColorStop(.45,'rgba(122,241,181,.12)');glow.addColorStop(1,'rgba(80,220,155,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(e.x,foot,e.radius*(.3+.7*growth),0,Math.PI*2);ctx.fill();
    ctx.shadowColor='#fff2bc';ctx.shadowBlur=15+25*growth;ctx.globalAlpha=fade*growth;ctx.drawImage(img,e.x-size/2,e.y-size/2,size,size);ctx.shadowBlur=0;
    for(let i=0;i<14;i++){const a=i*2.399,r=(30+i*8)*growth;ctx.fillStyle='#fff3bf';ctx.globalAlpha=fade*(.3+.4*Math.sin(e.age*3+i)**2);ctx.beginPath();ctx.arc(e.x+Math.cos(a)*r,foot-((e.age*55+i*23)%Math.max(30,size)),2+(i%3),0,Math.PI*2);ctx.fill();}
    if(e.burst){const wave=Math.min(1,(e.age-e.burstAt)/.6);ctx.strokeStyle='rgba(255,245,200,'+(fade*(1-wave))+')';ctx.lineWidth=5;ctx.beginPath();ctx.arc(e.x,e.y,e.radius*wave,0,Math.PI*2);ctx.stroke();}ctx.restore();continue;
   }
   if(e.healing){
    const fade=Math.max(0,Math.min(1,e.age/.3,(e.duration-e.age)/.4)),glow=ctx.createRadialGradient(e.x,e.y,5,e.x,e.y,95);glow.addColorStop(0,'rgba(140,255,203,.35)');glow.addColorStop(1,'rgba(100,240,180,0)');ctx.globalAlpha=fade;ctx.fillStyle=glow;ctx.beginPath();ctx.arc(e.x,e.y,95,0,Math.PI*2);ctx.fill();
    for(let i=0;i<list.length;i++){const animal=list[i];if(!animal.complete||!animal.naturalWidth)continue;const phase=(e.age/1.5+i/list.length)%1,a=-Math.PI/2+i*Math.PI*2/list.length,r=100*(1-phase);ctx.globalAlpha=fade*Math.sin(phase*Math.PI)*.55;ctx.save();ctx.translate(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r);ctx.rotate(a+Math.PI/2);const size=65*(1-phase*.45);ctx.drawImage(animal,-size/2,-size/2,size,size);ctx.restore();}ctx.restore();continue;
   }
   if(e.id==='royal_impact'){
    drawRoyalImpact(ctx,e,img,pose,ground);
    ctx.restore();continue;
   }
   if(e.id==='electric_link'){const dx=e.x-e.fromX,dy=e.y-e.fromY,len=Math.hypot(dx,dy);ctx.translate(e.fromX,e.fromY);ctx.rotate(Math.atan2(dy,dx));const count=Math.max(1,Math.ceil(len/65));for(let i=0;i<count;i++)ctx.drawImage(img,i*len/count,-32,len/count+12,64);ctx.restore();continue;}
   if(e.guard){
    for(const sword of e.guard.arrows){if(sword.spent)continue;const a=e.guard.angle+sword.index*Math.PI*2/e.guard.count,px=e.x+Math.cos(a)*e.guard.radius,py=e.y+Math.sin(a)*e.guard.radius;const shadow=()=>{ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(px,py+e.guard.size*.25,e.guard.size*.43,e.guard.size*.12,0,0,Math.PI*2);ctx.fill();};if(ground)ground.paint(ctx,shadow);else shadow();ctx.save();ctx.translate(px,py);ctx.rotate(a+Math.PI/2);const size=e.guard.size,h=size*img.naturalHeight/img.naturalWidth;ctx.drawImage(img,-size/2,-h/2,size,h);ctx.restore();}
   }else{if(e.mark){const scale=.65+.35*Math.min(1,e.age/.6);ctx.translate(e.x,e.y);ctx.scale(scale,scale);ctx.translate(-e.x,-e.y);}const h=e.size*img.naturalHeight/img.naturalWidth;ctx.drawImage(img,e.x-e.size/2,e.y-h/2,e.size,h);}ctx.restore();
  }}
  function consumeSword(sword){if(!guard||!guard.arrows.includes(sword)||sword.spent)return false;
   if(guard.id==='royal_protection'){const p=royalGuardPose(guard,sword.index);visual(guard.id,p.x,p.y,.34,p.size,{guardBreak:true,angle:p.angle,tilt:p.tilt,front:p.front});}
   if(guard.id==='arcane_protection'&&root.SorcererArcaneVisual){const p=root.SorcererArcaneVisual.pose(guard,sword.index);visual(guard.id,p.x,p.y,.34,p.size,{arcaneBreak:true,angle:p.angle,tilt:p.tilt,front:p.front});}
   sword.spent=true;if(guard.arrows.every(a=>a.spent)){const id=guard.id;guard=null;times[id]=cooldown(catalog.find(s=>s.id===id));}return true;}
  function setDevCooldown(value){if(root.GameMode?.dev!==true)return false;devCooldown=value===1?1:null;if(devCooldown!==null)for(const key of Object.keys(times))times[key]=Math.min(times[key],1);return true;}
  reset();return {setDevCooldown,consumeSword,cast,update,reset,draw,get cooldowns(){return {...times}},get incoming(){return 1},get basicDamage(){return fury>0?2:1},get attackRate(){return 1},get guard(){return guard},get furyVisual(){return {age:furyAge,remaining:fury}},get furyFrame(){return Math.floor(furyAge*12)%8},get berserk(){return fury>0},get effects(){return effects}};
 }
 root.VocationSpells={CATALOG,ART,IMPACT_ANCHORS,IMPACT_TIMING,impactPose,royalGuardPose,RANGES,TARGETED,targetStatus,targetPoint,images,create,demonicVolley};if(typeof module!=='undefined'&&module.exports)module.exports=root.VocationSpells;
})(typeof window!=='undefined'?window:globalThis);
