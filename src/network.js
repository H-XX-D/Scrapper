import{PILOTS}from'./catalog.js';
import{availablePilot}from'./crew.js';
export const PROTOCOL=4,MODES=['coop','ffa','pvpve'];
const PREFIX='scrapper-recovery-1-';
export const cleanCode=value=>String(value||'').toUpperCase().replace(/[^A-Z2-9]/g,'').slice(0,6);
export function sanitizeInput(d){if(!d||!Number.isSafeInteger(d.seq)||d.seq<0)return null;const number=(v,a,b)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):0;return{seq:d.seq,forward:number(d.forward,-1,1),strafe:number(d.strafe,-1,1),yaw:number(d.yaw,-1e6,1e6),pitch:number(d.pitch,-1.25,1.25),fire:d.fire===true,sprint:d.sprint===true,jump:d.jump===true,revive:d.revive===true,paused:d.paused===true,weapon:['bolt','arc','beam','rockets','frost','blades','flame'].includes(d.weapon)?d.weapon:'bolt',actions:Object.fromEntries(['interact','reload','wipe','choice0','choice1'].map(k=>[k,Number.isSafeInteger(d.actions?.[k])?Math.max(0,Math.min(1e9,d.actions[k])):0]))};}
export class NetRoom{
 constructor(onEvent){this.onEvent=onEvent;this.role='solo';this.self='host';this.members=[];this.connections=new Map();this.inputs=new Map();this.active=false;this.code='';this.generation=0;this.seq=0;this.lastSeq=-1;this.lastSend=0;this.lastInput=0;this.actions={interact:0,reload:0,wipe:0,choice0:0,choice1:0};this.metrics={rtt:0,frames:0};}
 emit(type,data={}){this.onEvent({type,...data});}
 async openPeer(id){return new Promise((resolve,reject)=>{if(!globalThis.Peer)return reject(Error('Multiplayer library did not load. Reopen the game.'));const peer=this.peer=new Peer(id,{debug:0,...(globalThis.SCRAPPER_PEER_OPTIONS||{})});let opened=false;const timer=setTimeout(()=>{if(!opened){peer.destroy();reject(Error('Room service timed out. Check the internet connection.'));}},14000);peer.on('open',()=>{opened=true;clearTimeout(timer);resolve(peer);});peer.on('connection',conn=>this.accept(conn));peer.on('error',e=>{clearTimeout(timer);if(!opened)reject(e);else this.emit('error',{message:e.type==='peer-unavailable'?'Room not found. Check the code.':e.message});});peer.on('disconnected',()=>{if(!peer.destroyed&&this.peer===peer)peer.reconnect();});});}
 async create(pilot,mode='coop'){
  this.leave();this.role='host';this.self='host';this.mode=MODES.includes(mode)?mode:'coop';const generation=this.generation,chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';this.code=Array.from(crypto.getRandomValues(new Uint8Array(6)),b=>chars[b%chars.length]).join('');this.members=[{id:'host',pilot:PILOTS[pilot]?pilot:'rook'}];this.emit('connecting');
  try{await this.openPeer(PREFIX+this.code);if(generation===this.generation)this.emit('lobby');}catch(e){if(generation===this.generation){this.leave();this.emit('error',{message:e.message});}}
 }
 async join(raw,pilot){
  const code=cleanCode(raw);if(code.length!==6){this.emit('error',{message:'Enter the six-character room code.'});return;}
  this.leave();this.role='guest';this.code=code;const generation=this.generation;this.emit('connecting');
  try{const peer=await this.openPeer();if(generation!==this.generation)return;this.self=peer.id;const conn=this.host=peer.connect(PREFIX+code,{reliable:true,serialization:'binary',metadata:{v:PROTOCOL,pilot}});this.timer=setTimeout(()=>{if(!this.members.length){this.leave();this.emit('error',{message:'The host could not be reached. Both players need a network that allows WebRTC.'});}},16000);
   conn.on('open',()=>this.send(conn,{type:'hello',pilot}));conn.on('data',d=>this.receive(conn,d));conn.on('close',()=>{if(this.host===conn){this.active=false;this.emit('hostLost');}});conn.on('error',e=>this.emit('error',{message:e.message||'Connection failed.'}));
  }catch(e){if(generation===this.generation){this.leave();this.emit('error',{message:e.message});}}
 }
 accept(conn){if(this.role!=='host'){conn.close();return;}conn.on('open',()=>{if(this.active||this.members.length>=4||conn.metadata?.v!==PROTOCOL){this.send(conn,{type:'reject',message:this.active?'Mission underway. Join the next deployment.':this.members.length>=4?'Crew full. Maximum four players.':'Game versions differ.'});setTimeout(()=>conn.close(),200);return;}this.connections.set(conn.peer,conn);});conn.on('data',d=>this.receive(conn,d));conn.on('close',()=>{if(this.connections.delete(conn.peer)){this.inputs.delete(conn.peer);this.members=this.members.filter(p=>p.id!==conn.peer);this.roster();this.emit('left',{id:conn.peer});}});conn.on('error',()=>conn.close());}
 send(conn,data){if(conn?.open)try{conn.send({v:PROTOCOL,...data});}catch(error){this.emit('error',{message:'Connection send failed: '+error.message});console.error('Scrapper network send',error);conn.close();}}
 broadcast(data){for(const c of this.connections.values())if((c.dataChannel?.bufferedAmount||0)<180000)this.send(c,data);}
 roster(){this.broadcast({type:'roster',members:this.members,mode:this.mode,code:this.code});this.emit('lobby');}
 receive(conn,d){if(!d||d.v!==PROTOCOL||typeof d.type!=='string')return;
  if(this.role==='host'){
   if(!this.connections.has(conn.peer))return;
   if(d.type==='hello'&&!this.active&&!this.members.some(p=>p.id===conn.peer)){const pilot=availablePilot(d.pilot,this.members);if(this.members.length>=4||!pilot){this.send(conn,{type:'reject',message:'Crew full.'});return;}this.members.push({id:conn.peer,pilot});this.roster();}
   else if(d.type==='input'&&this.active&&d.runId===this.runId){const clean=sanitizeInput(d);if(clean&&clean.seq>(this.inputs.get(conn.peer)?.seq??-1))this.inputs.set(conn.peer,{...clean,received:performance.now()});}
   else if(d.type==='ping')this.send(conn,{type:'pong',stamp:d.stamp});
  }else if(this.role==='guest'&&conn===this.host){
   if(d.type==='roster'){clearTimeout(this.timer);this.members=(d.members||[]).slice(0,4);this.mode=MODES.includes(d.mode)?d.mode:'coop';this.emit('lobby');}
   else if(d.type==='start'){this.runId=d.runId;this.active=true;this.lastSeq=-1;this.actions={interact:0,reload:0,wipe:0,choice0:0,choice1:0};this.emit('start',{settings:d.settings});}
   else if(d.type==='frame'&&this.active&&d.runId===this.runId&&d.seq>this.lastSeq){this.lastSeq=d.seq;this.metrics.frames++;this.emit('frame',{state:d.state});}
   else if(d.type==='pong')this.metrics.rtt=Math.round(performance.now()-d.stamp);
   else if(d.type==='reject'){this.leave();this.emit('error',{message:d.message});}
   else if(d.type==='return'){this.active=false;this.emit('lobby');}
  }
 }
 start(settings){if(this.role!=='host')return false;this.runId=crypto.randomUUID();this.active=true;this.seq=0;this.inputs.clear();this.broadcast({type:'start',runId:this.runId,settings:{...settings,mode:this.mode}});return true;}
 publish(state,now){if(this.role!=='host'||!this.active||now-this.lastSend<80)return;this.lastSend=now;this.broadcast({type:'frame',runId:this.runId,seq:++this.seq,state:typeof state==='function'?state():state});}
 input(data,now){if(this.role!=='guest'||!this.active||now-this.lastInput<40)return;this.lastInput=now;this.send(this.host,{type:'input',runId:this.runId,seq:++this.seq,...data,actions:this.actions});if(now-(this.lastPing||0)>2000){this.lastPing=now;this.send(this.host,{type:'ping',stamp:now});}}
 action(key){if(Object.hasOwn(this.actions,key))this.actions[key]++;}
 inputFor(id,now){const i=this.inputs.get(id);return i&&now-i.received<400?i:{forward:0,strafe:0,fire:false,jump:false,revive:false,paused:true,actions:{}};}
 returnToLobby(){if(this.role==='host'){this.active=false;this.broadcast({type:'return'});this.emit('lobby');}}
 leave(){this.generation++;clearTimeout(this.timer);const peer=this.peer;this.peer=null;const host=this.host;this.host=null;for(const c of this.connections.values())c.close();host?.close();peer?.destroy();this.connections.clear();this.inputs.clear();this.members=[];this.active=false;this.role='solo';this.self='host';this.code='';this.seq=0;this.lastSeq=-1;}
}
