/* O relógio da partida só começa depois do primeiro cenário decodificado. */
window.GameBoot=(()=>{
 'use strict';
 const overlay=document.getElementById('arena-transition'),status=document.getElementById('arena-load-status'),progress=document.getElementById('arena-load-progress');
 const images=[
  ...(bossPhaseActive?[kingSlimeBaseImg,kingSlimeOverlayImg,kingSlimeMobFrames[0]]:[mapStageBaseImgs[currentMapStage],mapStageOverlayImgs[currentMapStage],ravenMode?RavenStage.frames.emerald[0]:slimeFrames[0]]),
  heroImages[currentVocation],heroOverlayImages[currentVocation],shotImages[currentVocation]
 ].filter(image=>image&&image.getAttribute('src'));
 let loaded=0;
 async function waitForImage(image){
  image.fetchPriority='high';
  if(!image.complete)await new Promise((resolve,reject)=>{
   image.addEventListener('load',resolve,{once:true});image.addEventListener('error',reject,{once:true});
  });
  if(!image.naturalWidth)throw Error('Imagem essencial indisponível');
  if(image.decode)await image.decode();
  loaded++;progress.style.width=Math.round(loaded/images.length*100)+'%';
 }
 const ready=Promise.all(images.map(waitForImage)).then(()=>{
  // Pinta a arena antes de retirar a preparação, sem consumir a contagem inicial.
  draw();lastTime=performance.now();gameReady=true;
  document.body.classList.remove('arena-loading');overlay.classList.add('is-ready');
  setTimeout(()=>{overlay.hidden=true;},matchMedia('(prefers-reduced-motion: reduce)').matches?0:240);
  return true;
 }).catch(()=>{
  status.textContent='Não foi possível preparar a partida. Tente carregar novamente.';
  document.getElementById('arena-load-actions').hidden=false;
  return false;
 });
 return {ready};
})();
