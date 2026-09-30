// Browser adaptation of AURA's negotiated structure / acknowledged delta model.
// This is the Scrapper wire format, not the Python/native aura.aiwire format.
// Source and compatibility decisions are recorded in docs/aura-multiplayer-v13.md.
export const AURA_WORDS=('id type x y z hp groundY state age duration cooldown player crew actors projectiles waves infestation patches clingerPods nests cases pickups gates lifts switches secrets mission tasks radio elapsed matchTime ending guardians pilot arsenal slots selected reload visor stains active palette score frags deaths walkAge moving notice runId seq forward strafe yaw pitch sprint jump fire revive paused actions interact wipe choice0 choice1 struggle direction amount kind target damage radius life color row vx vy vz maxHp slow hitFlash attachedTo grab grabVisual grabRecovery grabImmune grabRelease tentacleState tentacleAge grabCooldown maturity dead deathAge burn extension span anchor nx ny nz floor surface reach room closed opening empty remaining spawned machine variant budget timer burstDone taken gun delay open locked dispensed safe grounded down downAge vy hurtCooldown revive dead complete success title label text key bridge puzzle campaign storyEvents seen queue history powered solved input required order enabled name index progress limit value held repeat strength escaped bolt arc beam rockets frost blades flame rook echo flint eos beetle crawler spitter splitter drone tank leech jelly bomber lancer scorpion priest bat warden worm shardling spider guardian matriarch marshal parallax overseer facehugger gnats burrower idle move hurt death tell altTell attack altAttack recover wall ceiling green cyan amber violet oil health ammo scrap gun layoutVersion chapter seed record choices power purge clock targetId inputSeq inputAge networkTime dormant').split(' ');
const dictionary=[...new Set(AURA_WORDS)],lookup=new Map(dictionary.map((s,i)=>[s,i]));
// Pinned to the exact ordered vocabulary; peers may fall back to raw snapshots.
export const AURA_CONTRACT='scrapper-aura-delta-1:cec78a8a7fc74bc681a501c2a4b63b7d1586b2803a7a1a3f759f25241b570161';
export const MAX_PACKET_BYTES=262144;
const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true});
const forbidden=new Set(['__proto__','prototype','constructor']);
const own=(o,k)=>Object.hasOwn(o,k);

export function encodeValue(value){
 let buffer=new Uint8Array(4096),offset=0;const strings=new Map();
 const room=n=>{if(offset+n>MAX_PACKET_BYTES)throw Error('AURA frame too large');if(offset+n>buffer.length){const b=new Uint8Array(Math.min(MAX_PACKET_BYTES,Math.max(buffer.length*2,offset+n)));b.set(buffer);buffer=b;}};
 const byte=v=>{room(1);buffer[offset++]=v;};
 const uint=n=>{do{const digit=n%128;n=Math.floor(n/128);byte(digit|(n?128:0));}while(n);};
 const write=(v,depth=0)=>{
  if(depth>48)throw Error('AURA nesting limit');
  if(v===null){byte(0);return;}if(v===false){byte(1);return;}if(v===true){byte(2);return;}
  if(typeof v==='number'){
   if(!Number.isFinite(v))throw Error('AURA requires finite numbers');
   if(Number.isSafeInteger(v)&&!Object.is(v,-0)){byte(v<0?4:3);uint(Math.abs(v));}
   else{byte(5);room(8);new DataView(buffer.buffer).setFloat64(offset,v,true);offset+=8;}return;
  }
  if(typeof v==='string'){
   if(lookup.has(v)){byte(9);uint(lookup.get(v));return;}
   if(strings.has(v)){byte(10);uint(strings.get(v));return;}
   const bytes=encoder.encode(v);byte(6);uint(bytes.length);room(bytes.length);buffer.set(bytes,offset);offset+=bytes.length;strings.set(v,strings.size);return;
  }
  if(Array.isArray(v)){byte(7);uint(v.length);for(const e of v)write(e,depth+1);return;}
  if(v&&typeof v==='object'){
   const entries=Object.entries(v).filter(([,v])=>v!==undefined);byte(8);uint(entries.length);
   for(const[k,value]of entries){if(forbidden.has(k))throw Error('Invalid AURA key');write(k,depth+1);write(value,depth+1);}return;
  }
  throw Error('Unsupported AURA value');
 };
 write(value);return buffer.slice(0,offset);
}

export function decodeValue(input){
 const bytes=input instanceof Uint8Array?input:input instanceof ArrayBuffer?new Uint8Array(input):null;
 if(!bytes||bytes.length>MAX_PACKET_BYTES)throw Error('Invalid AURA frame');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),strings=[];let offset=0,nodes=0;
 const require=n=>{if(offset+n>bytes.length)throw Error('Truncated AURA frame');};
 const byte=()=>{require(1);return bytes[offset++];};
 const uint=()=>{let n=0,p=1;for(let i=0;i<8;i++){const b=byte();n+=(b&127)*p;if(!Number.isSafeInteger(n))throw Error('AURA integer overflow');if(!(b&128))return n;p*=128;}throw Error('Invalid AURA integer');};
 const read=(depth=0)=>{
  if(depth>48||++nodes>100000)throw Error('AURA decode limit');
  const tag=byte();if(tag===0)return null;if(tag===1)return false;if(tag===2)return true;
  if(tag===3)return uint();if(tag===4)return-uint();if(tag===5){require(8);const n=view.getFloat64(offset,true);offset+=8;if(!Number.isFinite(n))throw Error('Invalid AURA number');return n;}
  if(tag===6){const length=uint();require(length);const s=decoder.decode(bytes.subarray(offset,offset+length));offset+=length;strings.push(s);return s;}
  if(tag===9||tag===10){const index=uint(),table=tag===9?dictionary:strings;if(index>=table.length)throw Error('Unknown AURA token');return table[index];}
  if(tag===7||tag===8){const length=uint();if(length>100000||length>bytes.length-offset)throw Error('Invalid AURA collection');
   if(tag===7){const a=[];for(let i=0;i<length;i++)a.push(read(depth+1));return a;}
   const o={};for(let i=0;i<length;i++){const k=read(depth+1);if(typeof k!=='string'||forbidden.has(k)||own(o,k))throw Error('Invalid AURA object key');o[k]=read(depth+1);}return o;
  }
  throw Error('Unknown AURA tag');
 };
 const value=read();if(offset!==bytes.length)throw Error('Trailing AURA bytes');return value;
}

// A missing patch means unchanged. Replacement, object and array operations are
// explicit so nulls, deletions, array shortening and removals remain unambiguous.
export function stateDelta(before,after){
 if(Object.is(before,after))return null;
 if(!before||!after||typeof before!=='object'||typeof after!=='object'||Array.isArray(before)!==Array.isArray(after))return[0,after];
 const changes={},removed=[];
 for(const k of Object.keys(after)){const patch=own(before,k)?stateDelta(before[k],after[k]):[0,after[k]];if(patch)changes[k]=patch;}
 if(Array.isArray(after))return before.length!==after.length||Object.keys(changes).length?[2,after.length,changes]:null;
 for(const k of Object.keys(before))if(!own(after,k))removed.push(k);
 return Object.keys(changes).length||removed.length?[1,changes,removed]:null;
}
export function applyDelta(before,patch,depth=0){
 if(depth>48||!Array.isArray(patch))throw Error('Invalid AURA patch');
 if(patch[0]===0&&patch.length===2)return patch[1];
 if(patch[0]===1&&before&&typeof before==='object'&&!Array.isArray(before)&&patch.length===3&&Array.isArray(patch[2])){
  const next={...before};for(const k of patch[2]){if(typeof k!=='string'||forbidden.has(k))throw Error('Invalid AURA removal');delete next[k];}
  for(const[k,p]of Object.entries(patch[1])){if(forbidden.has(k))throw Error('Invalid AURA patch key');next[k]=applyDelta(before[k],p,depth+1);}return next;
 }
 if(patch[0]===2&&Array.isArray(before)&&Number.isSafeInteger(patch[1])&&patch[1]>=0&&patch[1]<=100000){
  const next=before.slice(0,patch[1]);next.length=patch[1];for(const[k,p]of Object.entries(patch[2])){const i=Number(k);if(!Number.isSafeInteger(i)||i<0||i>=next.length)throw Error('Invalid AURA array index');next[i]=applyDelta(before[i],p,depth+1);}return next;
 }
 throw Error('AURA patch baseline mismatch');
}
function cleanValue(v){
 if(Array.isArray(v))return v.map(e=>e===undefined?null:cleanValue(e));
 if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).filter(([,e])=>e!==undefined).map(([k,e])=>[k,cleanValue(e)]));
 return v;
}
function wireState(state){
 const s=cleanValue(state);
 for(const name of['actors','projectiles','waves','events'])s[name]=Object.fromEntries((s[name]||[]).map(r=>[r.id,r]));
 if(s.infestation)s.infestation.patches=Object.fromEntries((s.infestation.patches||[]).map(r=>[r.id,r]));
 return s;
}
function gameState(state){
 const s=structuredClone(state); // Simulation must never mutate a delta baseline.
 for(const name of['actors','projectiles','waves','events'])s[name]=Object.values(s[name]||{});
 if(s.infestation)s.infestation.patches=Object.values(s.infestation.patches||{});
 return s;
}
export class AuraEncoder{
 constructor(){this.reset();}
 reset(){this.base=0;this.state=null;this.pending=new Map();this.lastKey=-Infinity;this.lastSend=-Infinity;}
 acknowledge(seq){const state=this.pending.get(seq);if(!state||seq<=this.base)return false;this.base=seq;this.state=state;for(const id of this.pending.keys())if(id<=seq)this.pending.delete(id);return true;}
 prepare(state,seq,now){
  if(this.pending.size>=8&&now-this.lastSend<500)return null;
  const value=wireState(state),key=!this.state||now-this.lastKey>3000;
  const patch=key?[0,value]:stateDelta(this.state,value)||[1,{},[]];
  return{seq,base:key?0:this.base,bytes:encodeValue(patch),value,key,now};
 }
 commit(frame){this.pending.set(frame.seq,frame.value);while(this.pending.size>8)this.pending.delete(this.pending.keys().next().value);this.lastSend=frame.now;if(frame.key)this.lastKey=frame.now;}
}
export class AuraDecoder{
 constructor(){this.reset();}
 reset(){this.history=new Map();this.seq=0;}
 accept({seq,base,bytes}){
  if(!Number.isSafeInteger(seq)||seq<=this.seq||!Number.isSafeInteger(base)||base<0||base>=seq)throw Error('Invalid AURA sequence');
  if(base&&!this.history.has(base))throw Error('Missing AURA baseline');
  const patch=decodeValue(bytes);if(!base&&patch[0]!==0)throw Error('Missing AURA keyframe');
  const next=applyDelta(base?this.history.get(base):null,patch);
  if(!next||typeof next!=='object'||Array.isArray(next))throw Error('Invalid AURA state');
  this.history.set(seq,next);this.seq=seq;while(this.history.size>32)this.history.delete(this.history.keys().next().value);
  return gameState(next);
 }
}
