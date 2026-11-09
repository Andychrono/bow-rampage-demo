/* Descobertas separadas da economia experimental. */
((root)=>{
  'use strict';
  const KEY='bbl_demo_online_v1_discoveries_v1';
  function read(){try{const data=JSON.parse(root.localStorage.getItem(KEY)||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{};}catch{return {};}}
  function write(data){try{root.localStorage.setItem(KEY,JSON.stringify(data));root.dispatchEvent(new Event('bow-discovery-changed'));return true;}catch{return false;}}
  function witchUnlocked(){return read().witch===true;}
  function unlockWitch(){return write({...read(),witch:true});}
  function merchantUnlocked(){return read().merchant===true;}
  function unlockMerchant(){return merchantUnlocked()||write({...read(),merchant:true});}
  function recordMerchantRun(){
    const data=read(),previous=data.merchantRunCycle;
    const cycle=Number.isInteger(previous)&&previous>=0&&previous<4?(previous+1)%4:1;
    return write({...data,merchantRunCycle:cycle})&&cycle===0;
  }
  function gardenerUnlocked(){return read().gardener===true;}
  function unlockGardener(){return gardenerUnlocked()||write({...read(),gardener:true});}
  function pactsUnlocked(){return false;}
  function unlockCrowBonus(){return false;}
  function unlockPacts(){return false;}
  function recordAttempt(){const data=read();return write({...data,frogAttempts:Math.min(10,(Number.isFinite(data.frogAttempts)?Math.max(0,Math.floor(data.frogAttempts)):0)+1)});}
  root.BowDiscovery={read,witchUnlocked,unlockWitch,merchantUnlocked,unlockMerchant,recordMerchantRun,gardenerUnlocked,unlockGardener,pactsUnlocked,unlockPacts,unlockCrowBonus,recordAttempt};
})(typeof window!=='undefined'?window:globalThis);
