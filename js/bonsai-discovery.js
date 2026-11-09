/* Uma muda por jornada na floresta, até o Jardineiro ser descoberto. */
((root) => {
 'use strict';
 const START = 300, WINDOW = 300, CHANCE = .35, GROWTH = 1, LIFETIME = GROWTH + 5;
 const MAP_X = .74, MAP_Y = .62;
 const frames = typeof Image === 'undefined' ? [] : Array.from({length:10}, (_, index) => {
  const frame = new Image();
  frame.src = 'assets/monsters/bonsai-growth/' + (index + 1) + '.webp';
  return frame;
 });
 function create(random = Math.random) {
  return {at:random()<CHANCE?START+random()*WINDOW:Infinity, spawned:false, item:null};
 }
 function step(state, dt, {time,width,height,eligible}) {
  if (!eligible) {
   state.item = null;
   return false;
  }
  if (state.item) {
   const item = state.item;
   item.x = MAP_X * width;
   item.y = MAP_Y * height;
   item.age += dt;
   if (item.age >= LIFETIME) state.item = null;
   return false;
  }
  if (state.spawned || time < state.at) return false;
  state.spawned = true;
  state.item = {x:MAP_X*width,y:MAP_Y*height,age:0};
  return true;
 }
 function collect(state, {x,y,unlock}) {
  const item = state.item;
  if (!item || item.age < GROWTH || Math.hypot(x-item.x,y-item.y) > 30) return 'miss';
  if (!unlock()) return 'storage';
  state.item = null;
  return 'collected';
 }
 function draw(ctx, state) {
  const item = state.item;
  if (!item) return;
  const frame = frames[Math.min(frames.length-1,Math.floor(item.age / GROWTH * frames.length))];
  if (!frame?.complete || !frame.naturalWidth) return;
  ctx.save();
  ctx.drawImage(frame,item.x-60,item.y-60,120,120);
  ctx.restore();
 }
 const api = {create,step,collect,draw};
 root.BonsaiDiscovery = api;
 if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
