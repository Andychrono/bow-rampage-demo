/* Destinos do acampamento sem trocar de página nem recriar o menu. */
(() => {
  'use strict';
  const original={merchantOpen:openShopModal,merchantClose:closeShopModal,witchOpen:openWitchShop,witchClose:closeWitchShop};
  const roster=document.querySelector('.arcade-wrapper');
  const merchant=document.getElementById('shop-modal'),witch=document.getElementById('witch-modal');
  const gardener=document.getElementById('gardener-modal'),gardenPath=document.getElementById('camp-to-gardener');
  const gardenPortrait=document.getElementById('gardener-portrait'),gardenDialogue=document.getElementById('gardener-dialogue');
  const panels={merchant,witch,gardener};
  const paths={merchant:document.getElementById('camp-to-merchant'),witch:document.getElementById('camp-to-witch'),gardener:gardenPath};
  let current='center',timer=0,generation=0;
  const duration=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?0:650;
  const stopAnimations=()=>{for(const el of Object.values(panels))el.classList.remove('camp-arriving','camp-departing');};
  function hideOthers(destination){
    if(destination!=='merchant')merchant.style.display='none';
    if(destination!=='witch'){witch.hidden=true;clearTimeout(witchMoodTimer);}
    if(destination!=='gardener')gardener.hidden=true;
  }
  function go(destination){
    if(destination==='merchant'&&!BowDiscovery.merchantUnlocked())return;
    if(destination==='witch'&&!BowDiscovery.witchUnlocked())return;
    if(destination==='gardener'&&!BowDiscovery.gardenerUnlocked())return;
    if(destination===current)return;
    const previous=current,version=++generation;
    if(previous==='witch'&&destination!=='witch')window.GrimoireMotion?.leave();
    if(previous==='merchant'&&destination!=='merchant'){window.BackpackUI?.reset();window.GustavForge?.cancel();}
    clearTimeout(timer);stopAnimations();
    current=destination;document.body.dataset.camp=destination;
    roster.inert=destination!=='center';
    if(destination==='center'){
      const leaving=panels[previous];
      leaving.inert=true;leaving.classList.add('camp-departing');
      document.body.style.overflow='';
      timer=setTimeout(()=>{
        if(version!==generation)return;
        if(previous==='merchant')original.merchantClose();
        if(previous==='witch')original.witchClose();
        if(previous==='gardener')playShopCloseSound();
        hideOthers('center');stopAnimations();leaving.inert=false;
        paths[previous].focus({preventScroll:true});
      },duration());
      return;
    }
    hideOthers(destination);
    const panel=panels[destination];
    panel.inert=false;
    if(destination==='merchant')original.merchantOpen();
    if(destination==='witch')original.witchOpen();
    if(destination==='gardener'){
      closeReveal();
      gardenPortrait.src='assets/characters/gardener-neutral.webp';
      gardenDialogue.textContent='Uma boa raiz faz toda a diferença, viajante.';
      gardener.hidden=false;
      playShopOpenSound();
    }
    document.body.style.overflow='hidden';
    panel.classList.add('camp-arriving');
    if(destination!=='witch')panel.querySelector('.btn-close-shop').focus({preventScroll:true});
    timer=setTimeout(()=>{if(version===generation)stopAnimations();},duration());
  }
  window.openShopModal=()=>go('merchant');
  window.openWitchShop=()=>go('witch');
  window.closeShopModal=()=>{if(current==='merchant')go('center');};
  window.closeWitchShop=()=>{if(current==='witch')go('center');};
  gardenPath.addEventListener('click',()=>go('gardener'));
  gardener.querySelector('.btn-close-shop').addEventListener('click',()=>go('center'));
  document.getElementById('gardener-talk').addEventListener('click',()=>{
    gardenPortrait.src='assets/characters/gardener-happy.webp';
    gardenDialogue.textContent='Volte quando os primeiros brotos aparecerem. Vamos cuidar deles juntos.';
    playUISelect();
  });
  function refreshDiscoveries(){
    paths.merchant.hidden=!BowDiscovery.merchantUnlocked();
    paths.witch.hidden=!BowDiscovery.witchUnlocked();
    paths.gardener.hidden=!BowDiscovery.gardenerUnlocked();
  }
  refreshDiscoveries();
  window.addEventListener('bow-discovery-changed',refreshDiscoveries);
  window.addEventListener('storage',refreshDiscoveries);
  document.body.dataset.camp='center';
  document.addEventListener('keydown',event=>{
    if(event.defaultPrevented || document.getElementById('pact-modal')?.hidden === false || document.getElementById('stage-modal')?.hidden===false)return;
    if(event.key==='Escape'&&current!=='center'){event.preventDefault();go('center');return;}
    const reveal=document.getElementById('reveal-screen');
    if(current==='center'&&getComputedStyle(reveal).display==='none'&&event.target===document.body){
      if(event.key==='ArrowLeft'){event.preventDefault();go('merchant');}
      if(event.key==='ArrowRight'){event.preventDefault();go('witch');}
    }
    if(event.key==='Tab'&&(current==='merchant'||current==='gardener')){
      const items=[...panels[current].querySelectorAll('button:not(:disabled),a[href]')].filter(el=>!el.closest('[inert],[hidden]')&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
      if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1).focus();}
      else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0].focus();}
    }
  });
})();
