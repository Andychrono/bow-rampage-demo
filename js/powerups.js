/* Catálogo compartilhado pelo grimório e pelo combate. */
((root) => {
  'use strict';
  const CATALOG = [
    {id:'auto_reload',name:'Recarga automática',desc:'Inicia a recarga quando faltar recurso para outro disparo. Você também pode recarregar pela tecla.',baseCost:35,costMult:1,maxLevel:1,format:n=>n?'Liberada':'Bloqueada'},
    {id:'charged_shot',name:'Disparo carregado',icon:'✦',desc:'Segure o botão direito e solte para lançar. Em 2 s gasta meia reserva; em 4 s gasta toda a reserva. O dano equivale ao custo em ataques básicos.',baseCost:120,costMult:1,maxLevel:1,format:n=>n?'Liberado':'Bloqueado'},
    {id:'atk_power',name:'Chama ancestral',icon:'✦',desc:'Encanta espadas, varinhas, espíritos e flechas. Mais dano em todas as vocações.',baseCost:35,costMult:1.45,maxLevel:10,format:n=>`+${n*8}% de dano`},
    {id:'max_hp',name:'Coração da floresta',icon:'♥',desc:'Um pacto de proteção. Comece cada partida com mais vida máxima.',baseCost:30,costMult:1.4,maxLevel:10,format:n=>`+${n*12} de vida máxima`},
    {id:'reserve_capacity',name:'Reserva ampliada',desc:'Acrescente um disparo básico à sua reserva por nível.',baseCost:45,costMult:1.6,maxLevel:3,scoped:true},
    {id:'second_wind',name:'Segundo fôlego',desc:'Encurte a pausa após esgotar sua reserva.',baseCost:50,costMult:1.6,maxLevel:3,scoped:true},
    {id:'regen_spd',legacy:true,name:'Fonte arcana',icon:'❋',desc:'Encurta a espera após esgotar o recurso.',baseCost:40,costMult:1.45,maxLevel:8,format:n=>`+${n*10}% de velocidade de recarga`},
    {id:'attack_speed',name:'Ritual da pressa',icon:'ϟ',desc:'Reduz o intervalo entre disparos. Cada tiro continua consumindo recurso.',baseCost:55,costMult:1.6,maxLevel:5,format:n=>`+${n*5}% de ataques básicos por segundo`},
    {id:'projectile_speed',name:'Sopro do luar',icon:'☽',desc:'Seus projéteis atravessam a clareira mais depressa, ajudando a alcançar alvos ágeis.',baseCost:25,costMult:1.5,maxLevel:5,format:n=>`+${n*8}% de velocidade dos projéteis`}
  ];
  for(const entry of CATALOG)entry.name=root.BowI18n?.t('powerup.'+entry.id+'.name',entry.name)??entry.name;
  const resources={Knight:{capacity:100,cost:25},Sorcerer:{capacity:100,cost:18},Druid:{capacity:5,cost:1},Archer:{capacity:6,cost:1}};
  const upgradeKey=(entry,vocation)=>entry.scoped ? (Object.hasOwn(resources,vocation) ? entry.id+'_'+vocation : null) : entry.id;
  function level(save,id,vocation){
    const entry=CATALOG.find(x=>x.id===id),key=entry&&upgradeKey(entry,vocation);
    const n=key&&save?.upgrades?.[key];
    return Number.isFinite(n)?Math.max(0,Math.min(entry.maxLevel,Math.floor(n))):0;
  }
  function reserveCapacity(vocation,n){
    const {capacity,cost}=resources[vocation];
    return capacity+cost*n;
  }
  function recoveryDelay(n){return (10-n)/10;}
  function formatScoped(entry,n,save,vocation){
    if(entry.id==='reserve_capacity')return Math.floor(reserveCapacity(vocation,n)/resources[vocation].cost)+' disparos';
    return (recoveryDelay(n)/bonuses(save).resource).toFixed(2).replace(/0$/,'').replace('.',',')+' s';
  }
  function cost(id,n){const u=CATALOG.find(x=>x.id===id);return u?Math.round(u.baseCost*Math.pow(u.costMult,Math.max(0,Math.min(u.maxLevel,Math.floor(n)||0)))):null;}
  function bonuses(save){return {damage:1+level(save,'atk_power')*.08,hp:level(save,'max_hp')*12,resource:1+level(save,'regen_spd')*.1,attackSpeed:1+level(save,'attack_speed')*.05,projectileSpeed:1+level(save,'projectile_speed')*.08};}
  function purchase(save,id,vocation){
    const u=CATALOG.find(x=>x.id===id);const key=u&&upgradeKey(u,vocation);if(!key||u.legacy)return {ok:false,reason:'unknown'};
    const n=level(save,id,vocation);if(n>=u.maxLevel)return {ok:false,reason:'max'};
    const price=cost(id,n);
    if(!Number.isFinite(save?.gold)||save.gold<price)return {ok:false,reason:'gold'};
    return {ok:true,cost:price,save:{...save,gold:save.gold-price,upgrades:{...save.upgrades,[key]:n+1}}};
  }
  const api={CATALOG,level,cost,bonuses,purchase,resources,reserveCapacity,recoveryDelay,formatScoped};
  root.BowPowerups=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
