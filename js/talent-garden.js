(() => {
  'use strict';
  const garden = document.getElementById('gardener-modal');
  const art = document.getElementById('talent-tree-art');
  const examine = document.getElementById('talent-tree-open');
  const branches = document.getElementById('talent-branches');
  const detail = document.getElementById('talent-tree-detail');
  const balance = document.getElementById('talent-gem-balance');
  const inscribe = document.getElementById('talent-inscribe');
  const vocations = [...garden.querySelectorAll('[data-talent-vocation]')];
  let vocation = 'Knight';
  let selected = null;

  function render() {
    const save = loadSaveData();
    const available = BowForge.gemBalance(save,vocation);
    balance.textContent = available+' '+(available===1?'gema disponível':'gemas disponíveis')+' · '+vocation;
    for (const button of vocations) {
      button.setAttribute('aria-pressed', button.dataset.talentVocation === vocation);
    }
    for (const button of branches.children) {
      const gem = BowTalents.catalog[vocation][Number(button.dataset.gem)];
      const unlocked = BowTeachings.known(save,vocation,gem.spell);
      button.classList.toggle('sealed', !unlocked);
      button.classList.toggle('learned', BowTalents.learned(save,vocation,gem));
      button.setAttribute('aria-pressed', selected === gem);
      button.setAttribute('aria-label', unlocked ? BowTeachings.get(vocation,gem.spell).name+' — '+gem.label : 'Gema selada');
    }
    examine.setAttribute('aria-expanded', !branches.hidden);
    examine.textContent = branches.hidden ? 'EXAMINAR BONSAI' : 'RECOLHER RAMOS';
    inscribe.hidden = true;
    if (!selected) {
      detail.textContent = branches.hidden ? 'Examine o bonsai para conhecer seus talentos.' : 'Selecione uma gema nos galhos.';
      return;
    }
    const spell = BowTeachings.get(vocation,selected.spell);
    if (!BowTeachings.known(save,vocation,spell.id)) {
      detail.textContent = 'Gema selada. Aprenda a magia correspondente no Caldeirão.';
      return;
    }
    detail.textContent = spell.name+' · '+selected.label;
    const learned = BowTalents.learned(save,vocation,selected);
    inscribe.hidden = false;
    inscribe.disabled = !learned && available===0;
    inscribe.textContent = learned ? 'DEVOLVER GEMA' : available ? 'ATIVAR · 1 GEMA' : 'GEMAS NA VERSÃO COMPLETA';
  }

  function selectVocation(next) {
    vocation = next;
    selected = null;
    art.src = 'assets/props/talent-tree-' + vocation.toLowerCase() + '.webp';
    art.alt = 'Bonsai do ' + vocation;
    branches.replaceChildren(...BowTalents.catalog[vocation].map((gem,index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'talent-gem';
      button.dataset.gem = index;
      button.style.left = gem.x+'%';
      button.style.top = gem.y+'%';
      button.addEventListener('click', () => {
        selected = gem;
        render();
        playUISelect();
      });
      return button;
    }));
    render();
  }

  const saved = localStorage.getItem(GameMode.prefix + 'vocation');
  selectVocation(Object.hasOwn(BowTalents.catalog,saved) ? saved : 'Knight');
  for (const button of vocations) {
    button.addEventListener('click', () => {
      if (button.dataset.talentVocation === vocation) return;
      selectVocation(button.dataset.talentVocation);
      playUISelect();
    });
  }
  examine.addEventListener('click', () => {
    branches.hidden = !branches.hidden;
    selected = null;
    render();
    playUISelect();
  });
  inscribe.addEventListener('click', () => {
    if (!selected || !BowDiscovery.gardenerUnlocked()) return;
    const save = loadSaveData();
    if (!BowTeachings.known(save,vocation,selected.spell)) return;
    const enabled = !BowTalents.learned(save,vocation,selected);
    if (enabled && BowForge.gemBalance(save,vocation)===0) return;
    const talents = {...save.talents,[vocation]:{...save.talents?.[vocation],[selected.id]:enabled}};
    const available = BowForge.gemBalance(save,vocation);
    if (!enabled && available===Number.MAX_SAFE_INTEGER) return;
    const talentGems = {...save.talentGems,[vocation]:available+(enabled?-1:1)};
    if (saveGameData({...save,talents,talentGems})) {
      render();
      playUISelect();
    } else detail.textContent = 'Não foi possível guardar o talento.';
  });
  window.addEventListener('bow-progress-changed',render);
  window.addEventListener('bow-discovery-changed',render);
})();
