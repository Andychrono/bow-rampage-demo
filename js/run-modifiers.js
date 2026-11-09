/* Temporary progression. The catalogue never writes to the player save. */
window.RunModifiers = (() => {
  const milestones = [30, 75, 140, 220, 320];
  const artwork = {
    M01: 'strong-shot', M02: 'quick-attack', M03: 'swift-projectile',
    M04: 'firm-impact', M08: 'full-reserve', M09: 'last-shot',
    M13: 'larger-reserve', M14: 'fast-reload', M15: 'fast-reload',
    M16: 'efficient-shot', M17: 'kill-resource', M18: 'quick-release',
    M19: 'free-shot', M21: 'reaction', M23: 'fast-reload', M25: 'extra-health',
    M26: 'tough-skin', M28: 'kill-healing', M29: 'kill-healing',
    M32: 'tough-skin', M35: 'prepared-guard'
  };
  const catalog = [
    ['M01','Disparo Forte','Ataque','+10% de dano no ataque básico por nível.'],
    ['M02','Ataque Rápido','Ataque','A cada nível, você faz 8% mais ataques básicos por segundo.'],
    ['M03','Projétil Veloz','Ataque','+15% de velocidade dos projéteis básicos por nível.'],
    ['M04','Impacto Firme','Ataque','O ataque básico empurra os inimigos 15% mais longe por nível.'],
    ['M08','Reserva Cheia','Ataque','O disparo que sai da reserva cheia causa +25% de dano por nível.'],
    ['M09','Último Disparo','Ataque','O disparo que esgota a reserva utilizável causa +35% de dano por nível.'],
    ['M13','Reserva Maior','Recurso','+20% de capacidade por nível. Flechas e sementes arredondam para cima.'],
    ['M14','Recuperação','Recurso','A cada nível, o recurso é recuperado 12% mais rápido durante a recarga.'],
    ['M15','Recarga Rápida','Recurso','Reduz em 15% por nível o tempo para recarregar a reserva.'],
    ['M16','Disparo Econômico','Recurso','Reduz em 8% por nível o custo de mana ou vigor do ataque básico.'],
    ['M17','Recurso por Abate','Recurso','Recupera 3% da reserva máxima por nível ao abater uma criatura, uma vez por segundo.'],
    ['M18','Saída Rápida','Recurso','Após encher a reserva, os próximos três ataques básicos têm +20% de velocidade de projétil por nível.'],
    ['M19','Disparo Grátis','Recurso','Após esgotar e encher a reserva, o primeiro ataque básico não gasta recurso.'],
    ['M21','Reação','Recurso','Ao sofrer dano, recupera 15% da reserva máxima por nível. Intervalo de 2 segundos.'],
    ['M23','Aljava ágil','Recurso','A cada nível, o Archer recupera as flechas 20% mais rápido durante a recarga.'],
    ['M25','Vida Extra','Sobrevivência','+15% de vida máxima por nível. Ao escolher, ganha vida igual ao aumento de vida máxima.'],
    ['M26','Pele Resistente','Sobrevivência','Recebe 8% menos dano por nível.'],
    ['M28','Vida por Abates','Sobrevivência','A cada oito abates após a escolha, recupera 1 de vida por nível.'],
    ['M29','Segundo fôlego','Sobrevivência','A cada 25 abates após a escolha, recupera 5% da vida perdida por nível.'],
    ['M32','Instinto de sobrevivência','Sobrevivência','Abaixo de 30% de vida, recebe 15% menos dano por nível.'],
    ['M35','Guarda Preparada','Sobrevivência','Após 20 segundos sem sofrer dano, o próximo golpe causa metade do dano.']
  ].map(([id,name,family,description]) => ({
    id, name, family, description,
    art: artwork[id] ? 'assets/modifiers/cards/campaign/modifier-' + artwork[id] + '.webp' : null,
    max: ['M19','M35'].includes(id) ? 1 : 3
  }));

  function create(vocation, random = Math.random, pact = false) {
    const thresholds = pact ? [20,45,80,125,180,245,320,410,520,650] : milestones;
    const ranks = new Map();
    let kills = 0, milestone = 0, offer = [];
    const rank = id => ranks.get(id) || 0;
    function next() {
      if (offer.length || kills < thresholds[milestone] || milestone >= thresholds.length) return offer;
      const pool = catalog.filter(card => {
        if (rank(card.id) >= card.max) return false;
        if (card.id === 'M23') return vocation === 'Archer';
        if (card.id === 'M16') return ['Knight','Sorcerer'].includes(vocation);
        return true;
      });
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [pool[i],pool[j]] = [pool[j],pool[i]];
      }
      offer = ['Ataque','Recurso','Sobrevivência'].map(family => pool.find(card => card.family === family)).filter(Boolean);
      return offer;
    }
    function choose(id) {
      const card = offer.find(entry => entry.id === id);
      if (!card) return null;
      ranks.set(id,rank(id)+1);
      milestone++;
      offer = [];
      return card;
    }
    return {
      rank,next,choose,
      recordKill(){return ++kills;},
      get milestone(){return thresholds[milestone];},
      get kills(){return kills;},
      selected(){return catalog.filter(card => rank(card.id));}
    };
  }
  return {create};
})();
