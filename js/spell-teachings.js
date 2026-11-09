/* Ensinamentos permanentes: receitas por vocação, sem gasto de ouro. */
((root)=>{
 'use strict';
 const ORBS={
  slime_green_orb:{name:'Orbe Verde',art:'assets/items/green-slime-essence.webp',color:'#4ade80'},
  slime_blue_orb:{name:'Orbe Azul',art:'assets/items/blue-slime-essence.webp',color:'#38bdf8'},
  slime_purple_orb:{name:'Orbe Roxo',art:'assets/items/purple-slime-essence.webp',color:'#c084fc'},
  slime_red_orb:{name:'Orbe Vermelho',art:'assets/items/red-slime-essence.webp',color:'#f87171'},
  slime_gray_orb:{name:'Orbe Cinzento',art:'assets/items/gray-slime-essence.webp',color:'#94a3b8'}
 };
 const RECIPES=[
  {slime_green_orb:10,slime_blue_orb:4},
  {slime_green_orb:14,slime_blue_orb:8,slime_purple_orb:4},
  {slime_blue_orb:10,slime_purple_orb:9,slime_red_orb:6},
  {slime_purple_orb:10,slime_red_orb:9,slime_gray_orb:6}
 ];
 const definitions={
  Archer:[['multidirectional','Tiro Triplo','archer-q-triple-shot.webp','Dispara três flechas em leque na direção da mira.'],['guardians','Flechas Guardiãs','archer-w-guardian-arrows.webp','Quatro flechas orbitam ao seu redor e se consomem ao atingir inimigos.'],['extermination','Flecha do Extermínio','archer-e-extermination-arrow.webp','Uma flecha poderosa atravessa até três inimigos.'],['rain','Chuva de Flechas','archer-r-arrow-rain.webp','Durante 5 segundos, uma chuva de flechas bombardeia os inimigos visíveis, incluindo os que chegam depois.']],
  Knight:[['piercing_sword','Espada Perfurante','knight-q-piercing-sword.webp'],['royal_protection','Proteção Real','knight-w-royal-protection.webp'],['royal_impact','Impacto Real','knight-e-royal-impact.webp'],['fury','Fúria','knight-r-berserk.webp']],
  Sorcerer:[['electric_link','Elo Elétrico','sorcerer-q-electric-link.webp'],['dark_vortex','Vórtice Sombrio','sorcerer-w-dark-vortex.webp'],['arcane_protection','Proteção Arcana','sorcerer-e-arcane-protection.webp'],['lightning_rain','Chuva de Raios','sorcerer-r-lightning-rain.webp']],
  Druid:[['spectral_pack','Matilha Espectral','druid-q-spectral-pack.webp'],['forest_roots','Raízes da Floresta','druid-w-forest-roots.webp'],['life_cycle','Ciclo da Vida','druid-e-life-cycle.webp'],['ancestral_spirit','Espírito Ancestral','druid-r-ancestral-spirit.webp']]
 };
 const DESCRIPTIONS={arcane_protection:'Cinco pequenos escudos giram rapidamente ao redor do Sorcerer. Cada bloqueio consome um escudo e faz o mob fugir; a recarga começa após o último.',piercing_sword:'Lança uma espada na direção da mira, atravessando todos os inimigos no caminho.',royal_protection:'Três escudos orbitam o Knight. Cada bloqueio consome um escudo e faz o mob virar de costas e fugir, sem ferir o jogador. A recarga começa após o último.',royal_impact:'Um impacto no ponto indicado pelo mouse causa dano e interrompe brevemente os inimigos.',fury:'Durante 7 segundos, entra em modo berserker, fica vermelho, tem vigor infinito e dispara espadas demoníacas em todas as direções, causando o dobro de dano.',electric_link:'Uma descarga salta entre até quatro inimigos próximos.',dark_vortex:'Cria um vórtice por 6 segundos, puxando inimigos e causando dano periódico.',lightning_rain:'Durante 5 segundos, raios bombardeiam os inimigos visíveis, incluindo os que chegam depois.',spectral_pack:'Um grande lobo espectral salta na direção da mira, atravessando os inimigos no caminho.',forest_roots:'Raízes causam dano e imobilizam os alvos atingidos por 3 segundos.',life_cycle:'Espíritos convergem para o Druid em um halo de cura, recuperando toda a vida ao longo de 3 segundos.',ancestral_spirit:'O Espírito Ancestral se manifesta centralizado no Druid, cresce iluminando a área e explode, dissolvendo os inimigos abatidos ao redor.'};
 const CATALOG=Object.fromEntries(Object.entries(definitions).map(([voc,spells])=>[voc,spells.map(([id,name,file,desc],slot)=>({id,name:root.BowI18n?.t('spell.'+id+'.name',name)??name,slot,key:'QWER'[slot],art:'assets/spell-icons/'+file,available:true,recipe:RECIPES[slot],desc:desc||DESCRIPTIONS[id]||'Este ensinamento ainda está selado. Não consome ingredientes.'}))]));
 const quantity=(save,key)=>Number.isSafeInteger(save?.inventory?.[key])&&save.inventory[key]>0?save.inventory[key]:0;
 const get=(voc,id)=>CATALOG[voc]?.find(s=>s.id===id)||null;
 const known=(save,voc,id)=>get(voc,id)?.available===true&&save?.spells?.[voc]?.[id]===true;
 function inspect(save,voc,id,witchUnlocked){
  const spell=get(voc,id);
  if(!spell)return {ok:false,reason:'unknown'};
  if(!witchUnlocked)return {ok:false,reason:'witch'};
  if(!spell.available)return {ok:false,reason:'sealed'};
  if(known(save,voc,id))return {ok:false,reason:'learned'};
  const previous=CATALOG[voc].filter(s=>s.slot<spell.slot&&s.available).at(-1);
  if(previous&&!known(save,voc,previous.id))return {ok:false,reason:'previous'};
  if(Object.entries(spell.recipe).some(([key,n])=>quantity(save,key)<n))return {ok:false,reason:'ingredients'};
  return {ok:true};
 }
 function learn(save,voc,id,witchUnlocked){
  const check=inspect(save,voc,id,witchUnlocked);if(!check.ok)return check;
  const inventory={...save.inventory};
  for(const [key,n] of Object.entries(get(voc,id).recipe)){inventory[key]-=n;if(!inventory[key])delete inventory[key];}
  return {ok:true,save:{...save,inventory,spells:{...save.spells,[voc]:{...save.spells?.[voc],[id]:true}}}};
 }
 const api={ORBS,RECIPES,CATALOG,get,known,quantity,inspect,learn};root.BowTeachings=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
