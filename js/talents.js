/* Cada gema define a posição na arte e uma melhoria de uma magia existente. */
window.BowTalents = (() => {
  const layouts = {
    Knight: [
      [37,53,'piercing_sword','Projétil extra com 60% do dano','extra',true],
      [35,34,'piercing_sword','Recarga: 14 → 11 s','cooldown',11],
      [42,22,'royal_protection','Escudos: 3 → 4','count',4],
      [57,29,'royal_protection','Recarga: 26 → 22 s','cooldown',22],
      [72,22,'royal_impact','Raio: 210 → 240','radius',240],
      [79,35,'royal_impact','Recarga: 22 → 18 s','cooldown',18],
      [71.5,52,'fury','Duração: 7 → 9 s','duration',9],
      [57,13.5,'fury','Recarga: 75 → 65 s','cooldown',65]
    ],
    Sorcerer: [
      [33,49,'electric_link','Alvos: 4 → 5','count',5],
      [35,34,'electric_link','Recarga: 14 → 11 s','cooldown',11],
      [43,22,'dark_vortex','Duração: 6 → 7,5 s','duration',7.5],
      [50,13,'dark_vortex','Recarga: 26 → 22 s','cooldown',22],
      [57,31.5,'arcane_protection','Escudos: 5 → 6','count',6],
      [67,19,'arcane_protection','Recarga: 28 → 24 s','cooldown',24],
      [75.5,28,'lightning_rain','Recarga: 85 → 72 s','cooldown',72],
      [78.5,41,'lightning_rain','Duração: 5 → 6 s','duration',6],
      [74,54,'dark_vortex','Raio: 140 → 160','radius',160]
    ],
    Druid: [
      [38.7,50,'spectral_pack','Lobo extra com 60% do dano','extra',true],
      [38.4,30,'spectral_pack','Recarga: 16 → 13 s','cooldown',13],
      [45.5,19.5,'forest_roots','Raio: 130 → 150','radius',150],
      [58.1,12,'forest_roots','Recarga: 24 → 20 s','cooldown',20],
      [60,31,'life_cycle','Recarga: 60 → 50 s','cooldown',50],
      [75.4,22,'life_cycle','Cura completa em 2,5 s (antes: 3 s)','duration',2.5],
      [78,38,'ancestral_spirit','Recarga: 80 → 68 s','cooldown',68]
    ],
    Archer: [
      [43,49,'multidirectional','Flechas: 3 → 5','count',5],
      [38,34,'multidirectional','Recarga: 15 → 12 s','cooldown',12],
      [43.6,23,'guardians','Flechas orbitantes: 4 → 5','count',5],
      [58,16,'guardians','Recarga: 22 → 18 s','cooldown',18],
      [61.3,34.5,'extermination','Flecha extra com 60% do dano','extra',true],
      [71.3,16,'extermination','Recarga: 20 → 17 s','cooldown',17],
      [78.5,30,'rain','Recarga: 90 → 75 s','cooldown',75],
      [78.7,49,'rain','Duração: 5 → 6 s','duration',6]
    ]
  };
  const catalog = Object.fromEntries(Object.entries(layouts).map(([voc, gems]) => [
    voc, gems.map(([x,y,spell,label,stat,value]) => ({id:spell+'_'+stat,x,y,spell,label,stat,value}))
  ]));
  const learned = (save,voc,gem) => save?.talents?.[voc]?.[gem.id] === true;
  function effects(save,voc) {
    const result = {};
    for (const gem of catalog[voc] || []) {
      if (!learned(save,voc,gem) || !BowTeachings.known(save,voc,gem.spell)) continue;
      (result[gem.spell] ??= {})[gem.stat] = gem.value;
    }
    return result;
  }
  return {catalog,learned,effects};
})();
