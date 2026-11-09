/* Economia de campanha compartilhada pelo resultado, pause e simulações. */
((root) => {
 'use strict';
 const KING_SLIME_GOLD = 40;
 const SLIME_CENTS = {mini:5,normal:15,big:35,blue:45,purple:70,red:90,gray:115,prism:200};
 const ORB_PRICES = {slime_green_orb:2,slime_blue_orb:4,slime_purple_orb:8,slime_red_orb:12,slime_gray_orb:18};
 function killCents(type,variant,forest=true) {
  return forest?(SLIME_CENTS[variant==='prism'?'prism':type]??0):55;
 }
 function campaignGold(cents, kingDefeated = false) {
  return Math.floor(Math.max(0,cents)/100)+(kingDefeated?KING_SLIME_GOLD:0);
 }
 function survivalGold(seconds) {
  return Math.min(5,Math.max(0,Math.floor(seconds/60)))*4;
 }
 const api = {campaignGold,killCents,survivalGold,ORB_PRICES};
 root.BowEconomy = api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
