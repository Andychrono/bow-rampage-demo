/* A mesma preparação cobre a saída do menu e a chegada à arena. */
(()=>{
 'use strict';
 const overlay=document.getElementById('arena-transition');
 let departing=false;
 window.enterArena=()=>{
  if(departing)return;
  departing=true;overlay.hidden=false;
  // Permite pintar a preparação antes de abandonar o documento do menu.
  setTimeout(()=>{location.href='game.html';},80);
 };
 window.addEventListener('pageshow',()=>{departing=false;overlay.hidden=true;});
})();
