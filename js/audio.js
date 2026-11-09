/* Mixer de gravações licenciadas. Créditos: assets/sounds/CREDITS.md. Compatível com file://. */
(() => {
  'use strict';
  const variants = (prefix, count) => Array.from({length:count}, (_,i)=>`effects/${prefix}_${i+1}.wav`);
  const one = name => [`effects/${name}.wav`];
  const events = {
    shot_knight:{files:variants('shot_knight',3),volume:.65,group:'shot',cooldown:70},
    shot_sorcerer:{files:variants('shot_sorcerer',3),volume:.65,group:'shot',cooldown:70},
    shot_druid:{files:variants('shot_druid',3),volume:.65,group:'shot',cooldown:70},
    shot_archer:{files:variants('shot_archer',3),volume:.65,group:'shot',cooldown:70},
    hit:{files:variants('hit',3),volume:.52,group:'impact',cooldown:55},
    critical:{files:variants('hit',3),volume:.65,group:'impact',cooldown:90,rate:.9},
    death:{files:variants('death',3),volume:.52,group:'enemy',cooldown:90},
    landing:{files:variants('landing',2),volume:.38,group:'enemy',cooldown:130},
    empty:{files:one('empty'),volume:.45,group:'ui',cooldown:250},
    damage:{files:one('damage'),volume:.75,group:'critical',cooldown:250},
    low_health:{files:one('damage'),volume:.22,group:'critical',cooldown:5000},
    shield:{files:one('shield'),volume:.5,group:'impact',cooldown:110},
    shield_break:{files:one('shield_break'),volume:.7,group:'critical',cooldown:200},
    dash:{files:one('dash'),volume:.38,group:'enemy',cooldown:160},
    fury:{files:one('fury'),volume:.5,group:'enemy',cooldown:250},
    rock:{files:one('rock'),volume:.45,group:'impact',cooldown:100},
    split:{files:one('split'),volume:.4,group:'enemy',cooldown:180},
    ui_click:{files:one('ui_click'),volume:.55,group:'ui',cooldown:60},
    ui_select:{files:one('ui_select'),volume:.65,group:'ui',cooldown:90},
    ui_back:{files:one('ui_back'),volume:.55,group:'ui',cooldown:90},
    ui_confirm:{files:one('ui_confirm'),volume:.65,group:'ui',cooldown:90,duration:.18},
    coin:{files:one('coin'),volume:.65,group:'ui',cooldown:140},
    bag:{files:one('bag'),volume:.55,group:'ui',cooldown:140},
    upgrade:{files:one('upgrade'),volume:.7,group:'ui',cooldown:180},
    tick:{files:one('tick'),volume:.6,group:'ui',cooldown:200},
    puzzle:{files:one('puzzle'),volume:.6,group:'ability',cooldown:80},
    puzzle_error:{files:one('puzzle_error'),volume:.65,group:'ability',cooldown:180},
    phase:{files:one('phase'),volume:.55,group:'ability',cooldown:700},
    boss_intro:{files:one('boss_intro'),volume:.7,group:'ability',cooldown:1600},
    victory:{files:one('victory'),volume:.75,group:'result',cooldown:1200},
    defeat:{files:one('defeat'),volume:.7,group:'result',cooldown:1200}
  };
  const chosenEvent=(file,volume,group,cooldown,duration)=>({files:one('chosen_'+file),volume,group,cooldown,...(duration?{duration}:{})});
  Object.assign(events,{
    arrow_flight:chosenEvent('arrow-flight',.23,'shot',160,.55),
    orbit:chosenEvent('orbit',.14,'ability',1200,.65),
    sword:chosenEvent('sword',.4,'ability',180,.7),
    royal_impact:chosenEvent('royal-impact',.6,'ability',650,1.1),
    electric_link:chosenEvent('electric-link',.45,'ability',150,.45),
    lightning:chosenEvent('lightning-impact',.34,'ability',230,.95),
    vortex:chosenEvent('vortex',.35,'ability',1000,1.5),
    roots:chosenEvent('forest-roots',.4,'ability',650,2),
    wolf:chosenEvent('spectral-pack',.4,'ability',1000,1.8),
    heal:chosenEvent('healing',.35,'ability',1000,2.5),
    ancestral:chosenEvent('ancestral-spirit',.6,'ability',1800,3),
    crow_flight:chosenEvent('crow-flight',.24,'enemy',700,1),
    crow:chosenEvent('crow-call',.3,'enemy',3500,1),
    frog:chosenEvent('frog',.3,'enemy',2200,1.4),
    step_forest:chosenEvent('forest-footstep',.15,'enemy',350,.45),
    step_mountain:chosenEvent('stone-footstep',.15,'enemy',350,.45),
    book_open:chosenEvent('book-open',.5,'ui',300,1),
    page_turn:chosenEvent('page-turn',.4,'ui',180,.8),
    signature:chosenEvent('scroll-signature',.4,'ui',500,2),
    cauldron:chosenEvent('cauldron',.3,'ability',1200,2.1),
    orb:chosenEvent('orb',.35,'ui',140,.45)
  });
  events.slime_hit=chosenEvent('slime-damage',.3,'impact',100,.5);
  // Separate short recorded textures instead of the shared long magic discharge.
  events.shot_sorcerer={...chosenEvent('electric-link',.28,'shot',70,.24),rate:.88};
  events.shot_druid={...chosenEvent('arrow-flight',.32,'shot',70,.32),rate:.82};
  delete events.ui_confirm.duration;
  Object.assign(events.death,{volume:.3,duration:.7});
  Object.assign(events.landing,{volume:.2,duration:.5});
  Object.assign(events.damage,{volume:.55,duration:.6});
  Object.assign(events.fury,{volume:.4,duration:1.2});
  Object.assign(events.boss_intro,{duration:1.5});
  const spellEvents={piercing_sword:'sword',royal_protection:'orbit',fury:'fury',electric_link:'electric_link',dark_vortex:'vortex',spectral_pack:'wolf',forest_roots:'roots',life_cycle:'heal',arcane_protection:'heal',ancestral_spirit:'ancestral',multidirectional:'shot_archer',guardians:'orbit',extermination:'arrow_flight',rain:'arrow_flight'};
  const defaultSettings={master:.7,effects:.65,ambience:.65,muted:false};
  const clamp = value => Math.max(0,Math.min(1,value));
  function settingsFrom(value) {
    const out={...defaultSettings};
    if(value && typeof value==='object') {
      for(const name of ['master','effects','ambience']) if(typeof value[name]==='number' && Number.isFinite(value[name]))out[name]=clamp(value[name]);
      if(typeof value.muted==='boolean')out.muted=value.muted;
    }
    return out;
  }
  function graph(context, settings, destination) {
    const effects=context.createGain(),ambience=context.createGain(),master=context.createGain();
    effects.gain.value=settings.effects;ambience.gain.value=settings.ambience;
    master.gain.value=settings.muted?0:settings.master;
    const compressor=context.createDynamicsCompressor();
    compressor.threshold.value=-12;compressor.knee.value=12;compressor.ratio.value=5;
    compressor.attack.value=.003;compressor.release.value=.15;
    const ceiling=context.createWaveShaper();
    const curve=new Float32Array(16385);
    for(let i=0;i<curve.length;i++) {
      const x=i*2/(curve.length-1)-1,absolute=Math.abs(x);
      curve[i]=absolute<=.8?x:Math.sign(x)*(.8+.16*(1-Math.exp(-(absolute-.8)/.16)));
    }
    ceiling.curve=curve;
    effects.connect(master);ambience.connect(master);master.connect(compressor);compressor.connect(ceiling);ceiling.connect(destination);
    return {effects,ambience,master,compressor,ceiling};
  }
  class AudioMixer {
    constructor() {
      let saved=null;try{saved=JSON.parse(localStorage.getItem('bbl_demo_online_v1_audio_v1')||'null')}catch{}
      this.settings=settingsFrom(saved);this.context=null;this.buffers={};this.loading=null;
      this.active=new Set();this.last=new Map();this.lastVariant=new Map();this.mode=document.body.dataset.audioScene||'menu';
      this.desiredAmbient={name:'forest',level:.6};this.ambient=null;this.failed=[];this.maxVoices=10;
      this.metrics={played:0,dropped:0,peakVoices:0};this.catalog=events;
    }
    async ready() {
      if(this.loading)return this.loading;
      const Constructor=window.AudioContext||window.webkitAudioContext;
      if(!Constructor)throw Error('Áudio não suportado neste navegador.');
      this.context=new Constructor();this.bus=graph(this.context,this.settings,this.context.destination);
      this.loading=Promise.all(Object.entries(window.BowAudioBank||{}).map(async ([name,base64])=>{
        try {
          const bytes=Uint8Array.from(atob(base64),character=>character.charCodeAt(0));
          this.buffers[name]=await this.context.decodeAudioData(bytes.buffer);
        }catch(error){this.failed.push(name);console.warn('Áudio indisponível:',name,error)}
      })).then(()=>this);
      return this.loading;
    }
    async unlock() {
      try {
        await this.ready();
        if(this.context.state==='suspended'&&!document.hidden)await this.context.resume();
        this.applySettings(false);this.setAmbient(this.desiredAmbient.name,this.desiredAmbient.level);
      }catch(error){console.warn(error.message)}
    }
    updateSettings(change) {
      this.settings=settingsFrom({...this.settings,...change});
      try{localStorage.setItem('bbl_demo_online_v1_audio_v1',JSON.stringify(this.settings))}catch{}
      this.applySettings();
    }
    applySettings(refresh=true) {
      if(this.context) {
        const now=this.context.currentTime;
        for(const [name,value] of [['effects',this.settings.effects],['ambience',this.settings.ambience],['master',this.settings.muted||document.hidden?0:this.settings.master]]) {
          this.bus[name].gain.cancelScheduledValues(now);
          this.bus[name].gain.setTargetAtTime(value,now,.03);
        }
      }
      if(refresh&&this.button)this.button.textContent=this.settings.muted?'MUDO':'SOM';
    }
    async play(name,options={}) {
      const config=events[name];if(!config||document.hidden||this.settings.muted)return false;
      if(this.mode==='result'&&['shot','enemy','impact'].includes(config.group))return false;
      const now=performance.now();
      if(!options.force&&now-(this.last.get(name)??-Infinity)<config.cooldown){this.metrics.dropped++;return false}
      this.last.set(name,now);
      const epoch=this.epoch;
      try{await this.ready()}catch{return false}
      if(epoch!==this.epoch||document.hidden||this.settings.muted||performance.now()-now>700)return false;
      if(this.context.state!=='running'){await this.unlock();if(this.context.state!=='running'||epoch!==this.epoch||performance.now()-now>700)return false}
      const same=[...this.active].filter(voice=>voice.group===config.group);
      const cap=config.group==='ability'?6:3;
      if(same.length>=cap){this.metrics.dropped++;return false}
      if(this.active.size>=this.maxVoices) {
        const expendable=[...this.active].find(voice=>['enemy','impact'].includes(voice.group));
        if(expendable && ['critical','result','ability','shot'].includes(config.group))this.stopVoice(expendable);
        else{this.metrics.dropped++;return false}
      }
      let index=Math.floor(Math.random()*config.files.length);
      if(config.files.length>1&&index===this.lastVariant.get(name))index=(index+1)%config.files.length;
      this.lastVariant.set(name,index);
      const buffer=this.buffers[config.files[index]];if(!buffer)return false;
      const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;
      source.playbackRate.value=(config.rate||1)*(options.rate||1);
      gain.gain.value=config.volume*(options.volume??1);
      source.connect(gain);gain.connect(this.bus.effects);
      const voice={source,gain,group:config.group,name};this.active.add(voice);
      source.onended=()=>{this.active.delete(voice);source.disconnect();gain.disconnect()};
      const start=this.context.currentTime+(options.delay||0);
      if(config.duration) {
        const stop=start+Math.min(config.duration,buffer.duration/source.playbackRate.value);
        gain.gain.setValueAtTime(gain.gain.value,start);
        gain.gain.setValueAtTime(gain.gain.value,Math.max(start,stop-.04));
        gain.gain.linearRampToValueAtTime(0,stop);
      }
      source.start(start);
      if(config.duration)source.stop(start+Math.min(config.duration,buffer.duration/source.playbackRate.value)+.001);
      this.metrics.played++;this.metrics.peakVoices=Math.max(this.metrics.peakVoices,this.active.size);
      return true;
    }
    stopVoice(voice) {this.active.delete(voice);try{voice.source.stop()}catch{}}
    stopEffects() {this.vortexWanted=false;this.vortexVoice=null;this.epoch=(this.epoch||0)+1;for(const voice of [...this.active])this.stopVoice(voice);this.last.clear();this.lastStage=null}
    syncVortex(visible,paused=false) {
      this.vortexWanted=visible&&!paused&&!document.hidden&&!this.settings.muted&&this.mode!=='result';
      if(!this.vortexWanted){
        const voice=this.vortexVoice;if(voice){this.vortexVoice=null;const now=this.context.currentTime;voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setTargetAtTime(0,now,.025);try{voice.source.stop(now+.12)}catch{}}
        return;
      }
      if(this.vortexVoice||this.vortexPending)return;
      const epoch=this.epoch;this.vortexPending=true;
      this.ready().then(()=>{
        if(!this.vortexWanted||epoch!==this.epoch||this.context.state!=='running')return;
        const original=this.buffers[events.vortex.files[0]];if(!original)return;
        if(!this.vortexBuffer){
          const overlap=Math.floor(original.sampleRate*.2),length=original.length-overlap;
          const buffer=this.context.createBuffer(original.numberOfChannels,length,original.sampleRate);
          for(let c=0;c<original.numberOfChannels;c++){
            const input=original.getChannelData(c),output=buffer.getChannelData(c);output.set(input.subarray(0,length));
            for(let i=0;i<overlap;i++){const t=i/overlap;output[i]=input[length+i]*(1-t)+input[i]*t;}
          }
          this.vortexBuffer=buffer;
        }
        const source=this.context.createBufferSource(),gain=this.context.createGain(),now=this.context.currentTime;
        source.buffer=this.vortexBuffer;source.loop=true;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(events.vortex.volume,now+.15);
        source.connect(gain);gain.connect(this.bus.effects);const voice={source,gain,group:'ability',name:'vortex'};
        this.vortexVoice=voice;this.active.add(voice);source.onended=()=>{this.active.delete(voice);if(this.vortexVoice===voice)this.vortexVoice=null;source.disconnect();gain.disconnect();};source.start();
      }).catch(()=>{}).finally(()=>{this.vortexPending=false;});
    }
    setMode(mode) {if(this.mode!==mode){this.stopEffects();this.mode=mode}}
    async setAmbient(name,level=.6) {
      this.desiredAmbient={name,level};if(!this.loading)return;
      await this.loading;
      if(this.desiredAmbient.name!==name)return;
      if(this.ambient?.name===name) {
        if(this.ambient.level!==level){this.ambient.level=level;this.ambient.gain.gain.setTargetAtTime(level,this.context.currentTime,.6)}
        return;
      }
      const buffer=this.buffers[`ambience/${name}.mp3`];if(!buffer)return;
      const now=this.context.currentTime;
      if(this.ambient) {
        const old=this.ambient;old.gain.gain.cancelScheduledValues(now);old.gain.gain.setTargetAtTime(0,now,.4);
        old.source.stop(now+2);
      }
      const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;source.loop=true;
      gain.gain.value=0;gain.gain.setTargetAtTime(level,now,.6);
      source.connect(gain);gain.connect(this.bus.ambience);
      source.onended=()=>{source.disconnect();gain.disconnect()};
      source.start();this.ambient={name,level,source,gain};
    }
    spell(id) {if(id==='dark_vortex')return false;return spellEvents[id]?this.play(spellEvents[id]):false}
    scene(stage,boss=false,region='forest') {if(this.lastStage!=null&&this.lastStage!==stage&&!boss)this.play('phase');this.lastStage=stage;this.setAmbient(region==='raven_peak'?'mountain':'forest',boss?.3:stage===1?.5:.65)}
    sequence(notes=[1,1.122,1.26,1.335,1.498]) {notes.forEach((rate,index)=>this.play('puzzle',{rate,delay:index*.28,force:true}))}
    async renderAudit(maximum=false, exportAudio=false) {
      await this.ready();
      const sampleRate=44100,duration=8,context=new OfflineAudioContext(1,sampleRate*duration,sampleRate);
      const settings=maximum?{master:1,effects:1,ambience:1,muted:false}:this.settings;
      const buses=graph(context,settings,context.destination);
      const add=(file,time,volume,bus='effects')=>{const source=context.createBufferSource(),gain=context.createGain();source.buffer=this.buffers[file];gain.gain.value=volume;source.connect(gain);gain.connect(buses[bus]);source.start(time)};
      add('ambience/forest.mp3',0,.65,'ambience');
      for(let time=.2;time<7;time+=.5){add('effects/shot_archer_1.wav',time,.65);add('effects/hit_3.wav',time+.16,.52)}
      for(let i=0;i<(maximum?10:5);i++)add('effects/death_'+(i%3+1)+'.wav',2+i*.025,.52);
      add('effects/boss_intro.wav',3,.7);add('effects/damage.wav',3.3,.75);add('effects/shield_break.wav',4.2,.7);add('effects/victory.wav',5.5,.75);
      const result=await context.startRendering(),samples=result.getChannelData(0);let peak=0,energy=0,clipped=0;
      for(const value of samples){peak=Math.max(peak,Math.abs(value));energy+=value*value;if(Math.abs(value)>=1)clipped++}
      const report={maximum,duration,peakDbfs:20*Math.log10(peak||1e-9),rmsDbfs:10*Math.log10(energy/samples.length||1e-18),clippedSamples:clipped};
      if(exportAudio) {
        const bytes=new Uint8Array(44+samples.length*2),view=new DataView(bytes.buffer);
        const text=(offset,value)=>{for(let i=0;i<value.length;i++)bytes[offset+i]=value.charCodeAt(i)};
        text(0,'RIFF');view.setUint32(4,bytes.length-8,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,samples.length*2,true);
        for(let i=0;i<samples.length;i++)view.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,samples[i]))*32767),true);
        let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));report.wav=btoa(binary);
      }
      return report;
    }
    installControls() {
      const style=document.createElement('style');style.textContent=`
      #audio-settings-button{position:fixed;right:16px;bottom:16px;z-index:110;font:10px 'Press Start 2P',monospace;background:#0d1829;color:#f5c842;border:1px solid #52617c;border-radius:5px;padding:12px;cursor:pointer}
      #audio-settings-dialog{position:fixed;inset:0;margin:auto;width:min(420px,90vw);box-sizing:border-box;background:#0c1423;color:#f1f5f9;border:2px solid #f5c842;border-radius:8px;padding:24px;font:12px/1.8 system-ui;z-index:12000;text-align:left}
      #audio-settings-dialog::backdrop{background:rgba(0,0,0,.78)}
      #audio-settings-dialog h2{font:16px 'Press Start 2P',monospace;color:#f5c842;margin:0 0 20px}
      #audio-settings-dialog label{display:block;margin:14px 0;font-size:16px}
      #audio-settings-dialog input[type=range]{display:block;width:100%;margin-top:6px;accent-color:#f5c842}
      #audio-settings-dialog button{font:14px system-ui;padding:10px 15px;background:#24354e;color:white;border:1px solid #74849d;border-radius:4px;cursor:pointer}
      #audio-settings-dialog output{float:right;color:#f5c842}
      #audio-settings-dialog small{display:block;color:#a6b5cb;margin-top:12px}
      `;document.head.append(style);
      const button=document.createElement('button');button.id='audio-settings-button';button.type='button';button.textContent=this.settings.muted?'MUDO':'SOM';button.setAttribute('aria-label','Configurar volume do jogo');this.button=button;
      const dialog=document.createElement('dialog');dialog.id='audio-settings-dialog';dialog.setAttribute('aria-labelledby','audio-settings-title');
      dialog.innerHTML='<h2 id="audio-settings-title">ÁUDIO</h2>';
      for(const [name,label] of [['master','Volume geral'],['effects','Efeitos'],['ambience','Ambiente']]) {
        const row=document.createElement('label');row.htmlFor='audio-'+name;row.textContent=label;
        const value=document.createElement('output');value.value=Math.round(this.settings[name]*100)+'%';row.append(value);
        const input=document.createElement('input');input.type='range';input.min='0';input.max='1';input.step='.05';input.value=this.settings[name];input.id='audio-'+name;
        input.addEventListener('input',()=>{this.updateSettings({[name]:Number(input.value)});value.value=Math.round(Number(input.value)*100)+'%'});row.append(input);dialog.append(row);
      }
      const muteRow=document.createElement('label'),mute=document.createElement('input');mute.type='checkbox';mute.id='audio-muted';mute.checked=this.settings.muted;mute.addEventListener('change',()=>this.updateSettings({muted:mute.checked}));muteRow.append(mute,document.createTextNode(' Silenciar tudo'));dialog.append(muteRow);
      const test=document.createElement('button');test.type='button';test.textContent='Testar efeito';test.addEventListener('click',()=>this.play('ui_confirm'));
      const close=document.createElement('button');close.type='button';close.textContent='Fechar';close.style.marginLeft='12px';close.addEventListener('click',()=>dialog.close());
      dialog.append(test,close);const help=document.createElement('small');help.textContent='Suas preferências ficam salvas neste navegador.';dialog.append(help);
      button.addEventListener('click',()=>{dialog.showModal();window.dispatchEvent(new CustomEvent('bow-audio-settings',{detail:{open:true}}))});
      dialog.addEventListener('close',()=>window.dispatchEvent(new CustomEvent('bow-audio-settings',{detail:{open:false}})));
      window.addEventListener('keydown',event=>{if(event.key==='Escape'&&dialog.open){event.preventDefault();event.stopImmediatePropagation();dialog.close()}},true);
      document.body.append(button,dialog);
    }
  }
  const mixer=window.BowAudio=new AudioMixer();
  const unlock=()=>mixer.unlock();
  window.addEventListener('pointerdown',unlock,{capture:true,once:true});window.addEventListener('keydown',unlock,{capture:true,once:true});
  document.addEventListener('visibilitychange',()=>{mixer.stopEffects();mixer.applySettings();if(!document.hidden&&mixer.context)mixer.unlock()});
  window.addEventListener('pagehide',()=>{mixer.stopEffects();if(mixer.context)mixer.context.close().catch(()=>{})});
  mixer.installControls();
})();
