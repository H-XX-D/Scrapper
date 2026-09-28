// Original layered PCM sounds: transient, body, moving air and mechanical tail.
// Samples are synthesized once, cached, and mixed through the same buses in the HTML export.
export const SOUND_PROFILES={
 bolt:{duration:.34,body:108,drop:60,crack:1.05,boom:.7,noise:.46,decay:20,metal:940,ring:.13},
 arc:{duration:.62,body:155,drop:80,crack:.7,boom:.65,noise:.24,decay:10,metal:460,ring:.32},
 beam:{duration:.86,body:80,drop:37,crack:1.15,boom:1.05,noise:.44,decay:8,metal:720,ring:.29},
 rockets:{duration:1.1,body:61,drop:31,crack:.64,boom:1.2,noise:.9,decay:5.4,metal:180,ring:.08},
 frost:{duration:.34,body:140,drop:65,crack:.38,boom:.36,noise:.9,decay:15,metal:2400,ring:.11},
 blades:{duration:.52,body:195,drop:80,crack:.66,boom:.43,noise:.4,decay:10,metal:1380,ring:.4},
 flame:{duration:.2,body:56,drop:16,crack:.05,boom:.25,noise:1.2,decay:4,metal:95,ring:.035},
 explosion:{duration:1.35,body:57,drop:29,crack:.82,boom:1.1,noise:1.1,decay:4.6,metal:200,ring:.04},
 acid:{duration:.48,body:160,drop:115,crack:.15,boom:.38,noise:.65,decay:10,metal:310,ring:.06},
 growl:{duration:.65,body:85,drop:30,crack:.12,boom:.55,noise:.36,decay:6,metal:150,ring:.12},
 impact:{duration:.22,body:120,drop:50,crack:.78,boom:.56,noise:.55,decay:27,metal:610,ring:.04},
 metal:{duration:.4,body:130,drop:50,crack:.72,boom:.35,noise:.33,decay:19,metal:1840,ring:.24},
 reload:{duration:.24,body:185,drop:80,crack:.45,boom:.32,noise:.46,decay:23,metal:900,ring:.15},
 latch:{duration:.15,body:210,drop:100,crack:.62,boom:.3,noise:.38,decay:35,metal:1250,ring:.13},
 pickup:{duration:.3,body:280,drop:-110,crack:.15,boom:.24,noise:.1,decay:17,metal:1250,ring:.2},
 deny:{duration:.2,body:88,drop:14,crack:.15,boom:.3,noise:.11,decay:14,metal:170,ring:.18},
 wipe:{duration:.7,body:45,drop:5,crack:0,boom:.035,noise:.6,decay:5,metal:140,ring:.01},
 steam:{duration:1.25,body:45,drop:0,crack:0,boom:.02,noise:.7,decay:2,metal:80,ring:0},
 air:{duration:.9,body:52,drop:0,crack:0,boom:.08,noise:.3,decay:2,metal:120,ring:.015},
 machine:{duration:.7,body:62,drop:3,crack:.04,boom:.24,noise:.18,decay:4,metal:185,ring:.055},
 compactor:{duration:.85,body:72,drop:30,crack:.45,boom:.48,noise:.25,decay:6,metal:390,ring:.12},
 step:{duration:.16,body:82,drop:35,crack:.21,boom:.48,noise:.5,decay:34,metal:600,ring:.06}
};
const TAU=Math.PI*2;
export function renderSound(id,seed=1,sampleRate=22050){
 const p=SOUND_PROFILES[id];if(!p)throw Error('Unknown sound '+id);
 const out=new Float32Array(Math.ceil(p.duration*sampleRate));let state=seed>>>0||1,low=0,mid=0,phase=0,metalPhase=0,previous=0;
 const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296*2-1;};
 for(let i=0;i<out.length;i++){
  const t=i/sampleRate,u=t/p.duration,n=random();low+=.027*(n-low);mid+=.22*(n-mid);const high=n-mid;
  const bodyFreq=p.body-p.drop*(1-Math.exp(-t*24));phase+=TAU*bodyFreq/sampleRate;metalPhase+=TAU*p.metal*(1-.35*u)/sampleRate;
  const attack=Math.min(1,t/.0015),end=Math.min(1,(p.duration-t)/.022),thump=Math.exp(-t*(id==='rockets'||id==='explosion'?7:18));
  let body=(Math.sin(phase)+.22*Math.sin(phase*2.02))*p.boom*thump;
  let crack=high*p.crack*Math.exp(-t*100),air=(mid*.72+low*2.6)*p.noise*Math.exp(-t*p.decay);
  let ring=(Math.sin(metalPhase)+.35*Math.sin(metalPhase*1.43))*p.ring*Math.exp(-t*12);
  if(id==='arc'){ring*=Math.sin(TAU*63*t);crack+=high*.28*Math.exp(-t*8)*(Math.sin(TAU*37*t)>.3?1:.12);}
  if(id==='beam')ring+=.14*Math.sin(metalPhase*.503+Math.sin(TAU*31*t)*3)*Math.exp(-t*6);
  if(id==='rockets'||id==='explosion')air+=low*3*Math.exp(-t*4.2)*(1+.3*Math.sin(TAU*22*t));
  if(id==='frost'){air+=high*.38*Math.exp(-t*13);ring*=.6+.4*Math.sin(TAU*130*t);}
  if(id==='blades')ring*=.6+.4*Math.sin(TAU*(22*t+40*t*t));
  if(id==='flame'){air=(mid+low*3)*p.noise*(.6+.4*Math.sin(TAU*31*t));body*=.4;}
  if(id==='growl'||id==='acid'){body*=.6+.4*Math.sin(TAU*32*t);ring+=Math.sin(phase*4+low*16)*.17*Math.exp(-t*7);}
  if(id==='wipe'){air=(mid*.4+low*1.5)*(.25+.75*Math.sin(Math.PI*u)**2);body=0;}
  if(id==='steam'||id==='air'){air=(mid*.58+high*.08+low*.4)*p.noise*Math.sin(Math.PI*u)**.65;body=0;}
  if(id==='machine'){body=(Math.sin(phase)+.22*Math.sin(phase*2.5))*.12*Math.sin(Math.PI*u)**.5;ring*=.4+.6*Math.sin(TAU*9*t)**2;}
  const clackTime=id==='bolt'?.07:id==='blades'?.045:-1;
  const clack=clackTime>=0&&t>clackTime?high*.22*Math.exp(-(t-clackTime)*120):0;
  const sample=Math.tanh((body+crack+air+ring+clack)*1.35)*.78*attack*end;
  // A gentle low pass takes the brittle top edge off the retro sample without losing its crack.
  previous+=.7*(sample-previous);out[i]=previous;
 }
 return out;
}
export function spatialMix(source,listener){
 if(!source||!listener)return{gain:1,pan:0};
 const dx=source.x-listener.x,dz=source.z-listener.z,dy=(source.y||0)-(listener.y||0),distance=Math.hypot(dx,dy,dz);
 return{gain:1/(1+(distance/11)**1.65),pan:Math.max(-.9,Math.min(.9,(dx*Math.cos(listener.yaw)-dz*Math.sin(listener.yaw))/Math.max(1,distance)))};
}
export class SoundStage{
 constructor(){this.context=null;this.buffers=new Map();this.voices=[];this.listener=null;this.serial=0;this.last=new Map();this.muted=false;this.level=.8;this.played={};}
 unlock(){
  if(!this.context){
   const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return false;
   const c=this.context=new Audio({latencyHint:'interactive'});this.master=c.createGain();this.master.gain.value=this.level;
   const limiter=this.limiter=c.createDynamicsCompressor();limiter.threshold.value=-9;limiter.knee.value=6;limiter.ratio.value=8;limiter.attack.value=.002;limiter.release.value=.11;
   const highpass=c.createBiquadFilter();highpass.type='highpass';highpass.frequency.value=32;
   highpass.connect(limiter).connect(this.master).connect(c.destination);this.buses={};
   for(const[name,level]of Object.entries({weapon:.78,world:.48,foley:.31,ui:.23})){const g=c.createGain();g.gain.value=level;g.connect(highpass);this.buses[name]=g;}
   const room=c.createConvolver(),impulse=c.createBuffer(2,Math.floor(c.sampleRate*.31),c.sampleRate);let seed=9;
   for(let ch=0;ch<2;ch++){const d=impulse.getChannelData(ch);let low=0;for(let i=0;i<d.length;i++){seed=(seed*1664525+1013904223)>>>0;low+=.18*(seed/2147483648-1-low);d[i]=low*Math.exp(-i/c.sampleRate*22)*(i/c.sampleRate>.014?1:0);}}
   room.buffer=impulse;const wet=c.createGain();wet.gain.value=.13;this.buses.weapon.connect(room);this.buses.world.connect(room);room.connect(wet).connect(highpass);
  }
  if(this.context.state==='suspended')this.context.resume().catch(()=>{});return true;
 }
 setPaused(paused){if(!this.context)return;this.master.gain.setTargetAtTime(paused?0:this.muted?0:this.level,this.context.currentTime,.035);if(paused)this.stopAll();}
 stopAll(){for(const v of this.voices){try{v.source.stop();}catch{}}this.voices=[];}
 setListener(player){this.listener=player;}
 buffer(id,variant=0){const key=id+':'+variant;if(this.buffers.has(key))return this.buffers.get(key);const samples=renderSound(id,31+variant*113,this.context.sampleRate),b=this.context.createBuffer(1,samples.length,this.context.sampleRate);b.copyToChannel(samples,0);this.buffers.set(key,b);return b;}
 play(id,{bus='world',gain=1,position=null,rate=1,minInterval=0,delay=0}={}){
  if(!this.context||this.context.state!=='running')return false;
  const c=this.context,now=c.currentTime,key=bus+':'+id;if(now-(this.last.get(key)??-100)<minInterval)return false;this.last.set(key,now);
  const spatial=spatialMix(position,this.listener);if(spatial.gain<.015)return false;
  this.voices=this.voices.filter(v=>v.end>now);const limit=bus==='world'?16:bus==='weapon'?8:5,same=this.voices.filter(v=>v.bus===bus);
  if(same.length>=limit){try{same[0].source.stop();}catch{}this.voices=this.voices.filter(v=>v!==same[0]);}
  const source=c.createBufferSource(),volume=c.createGain(),pan=c.createStereoPanner(),variant=this.serial++%4;
  source.buffer=this.buffer(id,variant);source.playbackRate.value=rate*(.98+variant*.012);volume.gain.value=gain*spatial.gain;pan.pan.value=spatial.pan;
  source.connect(volume).connect(pan).connect(this.buses[bus]);const start=now+delay;source.start(start);
  const voice={source,bus,end:start+source.buffer.duration/source.playbackRate.value};this.voices.push(voice);
  source.onended=()=>{source.disconnect();volume.disconnect();pan.disconnect();this.voices=this.voices.filter(v=>v!==voice);};this.played[id]=(this.played[id]||0)+1;return true;
 }
 weapon(id,options={}){return this.play(id,{bus:'weapon',gain:id==='flame'?.4:id==='frost'?.8:1,...options});}
 reload(id,stage){const rates={bolt:1,arc:.84,beam:.7,rockets:.61,frost:1.17,blades:1.3,flame:.78};return this.play(stage===2?'latch':'reload',{bus:'foley',rate:rates[id]||1,gain:stage===1?.85:1.1});}
 enemy(def,kind,position){return this.play(def.family==='MACHINE'?(kind==='rail'?'beam':'arc'):['acid','orb','fan','broodFan'].includes(kind)?'acid':'growl',{position,gain:def.tier==='BOSS'?1.2:.8,rate:def.tier==='BOSS'?.72:1,minInterval:.045});}
 ui(accepted=true){return this.play(accepted?'latch':'deny',{bus:'ui'});}
 snapshot(){return{state:this.context?.state||'locked',voices:this.voices.length,buffers:this.buffers.size,played:{...this.played},master:this.level,buses:{weapon:.78,world:.48,foley:.31,ui:.23}};}
}
