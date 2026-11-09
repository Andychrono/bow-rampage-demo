/* Twelve material stacks; permanent progression keys live outside the bag. */
((root)=>{
 'use strict';
 const CAPACITY=12;
 const occupied=save=>Object.values(save?.inventory||{}).filter(n=>Number(n)>0).length;
 const canAdd=(save,key)=>Number(save?.inventory?.[key])>0||occupied(save)<CAPACITY;
 const api={CAPACITY,occupied,canAdd};root.BowInventory=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
