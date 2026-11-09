/* Hotkeys are shared by spell slot across vocations, within this edition. */
window.SpellControls = (() => {
  const key = 'bbl_demo_online_v1_spell_controls_v1';
  const defaults = ['KeyQ','KeyW','KeyE','KeyR'];
  const arrows = {ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→'};
  const punctuation = {Minus:'-',Equal:'=',BracketLeft:'[',BracketRight:']',Backslash:'\\',Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/',Backquote:'`'};
  const allowed = code => typeof code === 'string' && (code === 'Space' || /^(Key[A-Z]|Digit[0-9]|Numpad[0-9])$/.test(code) || Object.hasOwn(arrows,code) || Object.hasOwn(punctuation,code));
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
        size: Number.isFinite(saved?.size) ? Math.max(100,Math.min(180,saved.size)) : 100,
        reload: allowed(saved?.reload) && !validKeys.includes(saved.reload) ? saved.reload : (['Space',...defaults,...Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ',c=>'Key'+c)].find(code=>!validKeys.includes(code))),
        position: position && Number.isFinite(position.x) && Number.isFinite(position.y) ? {x:clamp(position.x),y:clamp(position.y)} : null
      };
    } catch { return {keys:[...defaults],reload:'Space',position:null,size:100}; }
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
    const sizeInput = document.getElementById('spell-size');
    const sizeValue = document.getElementById('spell-size-value');
    const sizePreview = document.getElementById('spell-size-preview');

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
      sizeInput.value = settings.size;
      sizeValue.textContent = settings.size + '%';
      for (const element of [bar,preview,sizePreview]) element.style.setProperty('--spell-scale', String(settings.size / 100));
      reload.textContent = label(settings.reload) + ' · ALTERAR';
      const reloadButton = document.getElementById('reload-key-capture');
      if (reloadButton) reloadButton.textContent = capturing === 4 ? 'PRESSIONE A TECLA DESEJADA' : label(settings.reload);
      catalog.forEach((spell,index) => {
        rows.children[index].hidden = false;
        preview.children[index].hidden = !learned(spell.id);
        const button = bar.children[index], shortcut = label(codeFor(spell));
        button.querySelector('kbd').textContent = shortcut;
        button.title = spell.name + ' · ' + shortcut + ' · ' + spell.cooldown + 's';
        button.setAttribute('aria-label',spell.name + ', tecla ' + shortcut);
        rows.children[index].querySelector('button').textContent = capturing === index ? 'PRESSIONE A TECLA DESEJADA' : shortcut;
        preview.children[index].querySelector('kbd').textContent = shortcut;
      });
      position(bar);
      position(preview);
    }
    function captureReload(){capturing=4;status.textContent='Pressione a tecla desejada para recarregar. Esc cancela.';paint();document.getElementById('reload-key-capture').focus();}
    reload.onclick = () => { dialog.showModal();showPosition(false);captureReload(); };
    const reloadRow=document.createElement('div'),reloadName=document.createElement('span'),reloadButton=document.createElement('button');
    reloadName.textContent='Recarregar recurso';reloadButton.id='reload-key-capture';reloadButton.type='button';reloadButton.onclick=captureReload;reloadRow.append(reloadName,reloadButton);
    for (const spell of catalog) {
      const index = slot(spell);
      const row = document.createElement('div');
      const name = document.createElement('span');
      name.textContent = learned(spell.id) ? spell.name : 'Magia ' + spell.key;
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
    rows.append(reloadRow);
    for (const spell of catalog.filter(spell=>learned(spell.id))) {
      const icon=document.createElement('span'),image=document.createElement('img');
      icon.className='spell-button';image.src=spell.icon;image.alt=spell.name;icon.append(image);sizePreview.append(icon);
    }
    sizePreview.hidden = !catalog.some(spell=>learned(spell.id));
    sizeInput.oninput = () => {settings.size=Math.max(100,Math.min(180,Number(sizeInput.value)||100));paint();save();};
    document.getElementById('spell-move-button').hidden = !catalog.some(spell=>learned(spell.id));
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
      const previous = capturing === 4 ? settings.reload : settings.keys[capturing];
      const other = settings.keys.indexOf(event.code);
      let swapped = false;
      if (capturing === 4) {
        if (other >= 0) {settings.keys[other] = previous;swapped = previous !== event.code;}
        settings.reload = event.code;
      } else {
        if (event.code === settings.reload) {settings.reload = previous;swapped = true;}
        else if (other >= 0) {settings.keys[other] = previous;swapped = previous !== event.code;}
        settings.keys[capturing] = event.code;
      }
      capturing = -1;
      status.textContent = swapped ? 'Atalhos trocados para evitar conflito.' : 'Atalho atualizado.';
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
      settings = {keys:[...defaults],reload:defaults.includes(settings.reload)?'Space':settings.reload,position:null,size:100};
      status.textContent = 'Tamanho, posição e atalhos padrão restaurados.';
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
