/* Hotkeys are shared by spell slot across vocations, within this edition. */
window.SpellControls = (() => {
  const key = 'bbl_demo_online_v1_spell_controls_v1';
  const defaults = ['KeyQ','KeyW','KeyE','KeyR'];
  const arrows = {ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→'};
  const punctuation = {Minus:'-',Equal:'=',BracketLeft:'[',BracketRight:']',Backslash:'\\',Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/',Backquote:'`'};
  const allowed = code => typeof code === 'string' && (/^(Key[A-Z]|Digit[0-9]|Numpad[0-9])$/.test(code) || Object.hasOwn(arrows,code) || Object.hasOwn(punctuation,code));
  const label = code => code==='Space'?'Espaço':arrows[code] || punctuation[code] || code.replace(/^(Key|Digit)/,'').replace(/^Numpad/,'NUM ');
  const clamp = value => Math.max(0,Math.min(1,value));
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      const keys = saved?.keys;
      const position = saved?.position;
      const validKeys = Array.isArray(keys) && keys.length === 4 && keys.every(allowed) && new Set(keys).size === 4 ? keys : [...defaults];
      return {
        keys: validKeys,
        reload: allowed(saved?.reload) && !validKeys.includes(saved.reload) ? saved.reload : 'Space',
        position: position && Number.isFinite(position.x) && Number.isFinite(position.y) ? {x:clamp(position.x),y:clamp(position.y)} : null
      };
    } catch { return {keys:[...defaults],reload:'Space',position:null}; }
  }
  function create(bar, catalog, learned = () => true) {
    let settings = load(), capturing = -1, drag = null;
    const dialog = document.getElementById('spell-settings');
    const panel = document.getElementById('spell-settings-panel');
    const positionPanel = document.getElementById('spell-position-panel');
    const preview = document.getElementById('spell-position-preview');
    const status = document.getElementById('spell-settings-status');
    const rows = document.getElementById('spell-key-options');
    const reload = document.getElementById('reload-key');
    const reloadCodes = ['Space',...Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ',letter=>'Key'+letter),...Array.from('0123456789',digit=>'Digit'+digit),...Array.from('0123456789',digit=>'Numpad'+digit),...Object.keys(arrows),...Object.keys(punctuation)];
    const slot = spell => defaults.indexOf('Key'+spell.key);
    const codeFor = spell => settings.keys[slot(spell)];
    function save() {
      try { localStorage.setItem(key,JSON.stringify(settings)); return true; }
      catch { status.textContent = 'As preferências valem nesta sessão. O navegador não conseguiu salvá-las.'; return false; }
    }
    function position(element) {
      const p = settings.position;
      element.style.left = p ? p.x * Math.max(0,innerWidth-element.offsetWidth) + 'px' : '';
      element.style.top = p ? p.y * Math.max(0,innerHeight-element.offsetHeight) + 'px' : '';
      if (element === preview) positionPanel.classList.toggle('position-help-bottom',!p || p.y < .5);
    }
    function paint() {
      reload.replaceChildren(...reloadCodes.filter(code=>!settings.keys.includes(code)).map(code=>new Option(label(code),code)));
      reload.value = settings.reload;
      catalog.forEach((spell,index) => {
        rows.children[index].hidden = !learned(spell.id);
        preview.children[index].hidden = !learned(spell.id);
        const button = bar.children[index], shortcut = label(codeFor(spell));
        button.querySelector('kbd').textContent = shortcut;
        button.title = spell.name + ' · ' + shortcut + ' · ' + spell.cooldown + 's';
        button.setAttribute('aria-label',spell.name + ', tecla ' + shortcut);
        rows.children[index].querySelector('button').textContent = capturing === index ? 'PRESSIONE UMA TECLA' : shortcut;
        preview.children[index].querySelector('kbd').textContent = shortcut;
      });
      position(bar);
      position(preview);
    }
    reload.onchange = () => { settings.reload=reload.value;save(); };
    for (const spell of catalog) {
      const index = slot(spell);
      const row = document.createElement('div');
      const name = document.createElement('span');
      name.textContent = spell.name;
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label','Trocar atalho de ' + spell.name);
      button.onclick = () => {
        capturing = index;
        status.textContent = 'Pressione o novo atalho. Esc cancela a troca.';
        paint();
      };
      row.append(name,button);
      rows.append(row);
      const icon = document.createElement('span');
      icon.className = 'spell-button';
      const image = document.createElement('img');
      image.src = spell.icon;
      image.alt = '';
      icon.append(image,document.createElement('kbd'));
      preview.append(icon);
    }
    function move(x,y) {
      settings.position = {
        x:clamp(x / Math.max(1,innerWidth-preview.offsetWidth)),
        y:clamp(y / Math.max(1,innerHeight-preview.offsetHeight))
      };
      position(preview);
      position(bar);
    }
    function showPosition(show) {
      capturing = -1;
      drag = null;
      panel.hidden = show;
      positionPanel.hidden = !show;
      preview.hidden = !show;
      paint();
      (show ? preview : document.getElementById('spell-move-button')).focus();
    }
    dialog.addEventListener('keydown',event => {
      if (capturing < 0) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.repeat) return;
      if (event.key === 'Escape') {
        capturing = -1;
        status.textContent = '';
        paint();
        return;
      }
      if (event.ctrlKey || event.altKey || event.metaKey || !allowed(event.code)) {
        status.textContent = 'Use uma letra, número, seta ou tecla de pontuação.';
        return;
      }
      const previous = settings.keys[capturing];
      if(event.code===settings.reload){
        status.textContent = 'Esse atalho está reservado para a recarga.';
        return;
      }
      const other = settings.keys.indexOf(event.code);
      if (other >= 0) settings.keys[other] = previous;
      settings.keys[capturing] = event.code;
      capturing = -1;
      status.textContent = other >= 0 && previous !== event.code ? 'Os dois atalhos foram trocados.' : 'Atalho atualizado.';
      save();
      paint();
    });
    dialog.addEventListener('cancel',event => {
      if (preview.hidden) return;
      event.preventDefault();
      showPosition(false);
    });
    dialog.addEventListener('close',() => {capturing = -1;drag = null;});
    preview.addEventListener('pointerdown',event => {
      if (event.button !== 0) return;
      event.preventDefault();
      const rect = preview.getBoundingClientRect();
      drag = {id:event.pointerId,x:event.clientX-rect.left,y:event.clientY-rect.top};
      preview.setPointerCapture(event.pointerId);
    });
    preview.addEventListener('pointermove',event => {
      if (drag?.id === event.pointerId) move(event.clientX-drag.x,event.clientY-drag.y);
    });
    function endDrag(event) {
      if (drag?.id !== event.pointerId) return;
      drag = null;
      save();
    }
    preview.addEventListener('pointerup',endDrag);
    preview.addEventListener('lostpointercapture',endDrag);
    preview.addEventListener('keydown',event => {
      if (!Object.hasOwn(arrows,event.code)) return;
      event.preventDefault();
      const rect = preview.getBoundingClientRect();
      const step = event.shiftKey ? 32 : 8;
      move(rect.left + (event.code==='ArrowRight' ? step : event.code==='ArrowLeft' ? -step : 0),
        rect.top + (event.code==='ArrowDown' ? step : event.code==='ArrowUp' ? -step : 0));
      save();
    });
    document.getElementById('spell-move-button').onclick = () => showPosition(true);
    document.getElementById('spell-position-done').onclick = () => showPosition(false);
    document.getElementById('spell-settings-close').onclick = () => dialog.close();
    document.getElementById('spell-settings-reset').onclick = () => {
      capturing = -1;
      settings = {keys:[...defaults],reload:defaults.includes(settings.reload)?'Space':settings.reload,position:null};
      status.textContent = 'Posição e atalhos padrão restaurados.';
      save();
      paint();
    };
    window.addEventListener('resize',() => { position(bar);position(preview); });
    new ResizeObserver(() => position(bar)).observe(bar);
    paint();
    return {
      codeFor,
      get reloadCode(){return settings.reload;},
      get reloadLabel(){return label(settings.reload);},
      get open(){return dialog.open;},
      show(){
        status.textContent = '';
        dialog.showModal();
        showPosition(false);
      }
    };
  }
  return {create};
})();
