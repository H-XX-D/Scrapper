const mod=(n,m)=>(n%m+m)%m;
const clone=v=>structuredClone(v);
export const NEW_PUZZLES=['circuit','cargo','frequency','airlock','crane','memory','plates','loadshare','thermal','quarantine','spectrum','dispatch'];
export const PUZZLE_NAMES={circuit:'RESTORE FREIGHT POWER',cargo:'SORT ARCHIVE CONTAINERS',frequency:'ISOLATE THE CHOIR SIGNAL',airlock:'CYCLE THE DECONTAMINATION LOCK',crane:'RECOVER THE BONDED CARGO',memory:'REPLAY THE REAL DISTRESS CALL',plates:'CROSS THE ROOT SENSOR GRID',loadshare:'BALANCE THE REPAIR NETWORK',thermal:'COOL THE DEMOLITION CIRCUIT',quarantine:'ISOLATE THREE CARRIER SAMPLES',spectrum:'FILTER THE EMERGENCY CHANNELS',dispatch:'STOP THE AUTONOMOUS SHIPMENT'};
export const CHAPTER_PUZZLES=NEW_PUZZLES.map((kind,i)=>[kind,...({1:['pressure'],3:['mirrors'],7:['timing'],9:['coolant']}[i]||[])]);
const palette=['#70f4d2','#ff91d9','#f5df72','#9bc1ff'];
const colors=['RED','GREEN','BLUE','CYAN','MAGENTA','WHITE'];
const roomFor=['hall','west','east','upper','hall','west','cross','armory','upper','west','cross','upper'];
const manhattan=(a,b)=>Math.abs(a%3-b%3)+Math.abs(Math.floor(a/3)-Math.floor(b/3));
function nearbyFloor(world,p,used=[]){
 const candidates=world.renderCells().filter(c=>!c.gap&&!c.gate&&Math.abs(c.y-p.y)<.15&&world.canMove(c.x*2+1,c.z*2+1,.7,p.y));
 candidates.sort((a,b)=>(a.x*2+1-p.x)**2+(a.z*2+1-p.z)**2-((b.x*2+1-p.x)**2+(b.z*2+1-p.z)**2));
 const c=candidates.find(c=>used.every(n=>Math.hypot(n.x-(c.x*2+1),n.z-(c.z*2+1))>2.6))||candidates[0];
 return c?{x:c.x*2+1,z:c.z*2+1,y:c.y}:p;
}
export class PuzzleSystem{
 constructor(world,kind,chapter=0){
  this.world=world;this.kind=kind;this.chapter=chapter;this.clock=0;this.solved=false;this.nodes=[];this.state={};
  const index=NEW_PUZZLES.indexOf(kind),r=world.rooms.find(r=>r.id===roomFor[index]),center=r.center;
  const add=(action,label,offset=0,extra={})=>{const n={id:kind+'-'+action,kind:'device',action,label,system:kind,index:offset,row:index%8,tint:palette[index%4],...nearbyFloor(world,{x:center.x+(offset%3-1)*4,z:center.z+Math.floor(offset/3)*4-3,y:center.y},this.nodes),...extra};this.nodes.push(n);return n;};
  this.add=add;
  if(kind==='circuit'){
   this.state.bits=[true,true,true,true,true];for(const j of [0,2,3])for(const k of[j-1,j,j+1])if(k>=0&&k<5)this.state.bits[k]=!this.state.bits[k];
   for(let i=0;i<5;i++)add('fuse-'+i,'TOGGLE ADJACENT FUSES',i,{slot:i,row:1});
  }else if(kind==='cargo'){
   // Legal moves from the solved board guarantee a solvable sliding puzzle.
   const board=[1,2,3,4,5,6,7,8,0];let blank=8;for(const next of[7,4,3,6,7,4,1,0,3,4,5,8]){[board[blank],board[next]]=[board[next],board[blank]];blank=next;}this.state.board=board;
   for(let i=0;i<9;i++)add('slide-'+i,'SLIDE CONTAINER INTO EMPTY BAY',i,{slot:i,row:1});
  }else if(kind==='frequency'){
   this.state.dials=[0,0,0];this.state.target=[2+world.seed%5,2+(world.seed>>>2)%5,2+(world.seed>>>4)%5];
   for(let i=0;i<3;i++)add('dial-'+i,'TUNE SIGNAL DIAL',i,{slot:i,row:4});
  }else if(kind==='airlock'){
   this.state.step=0;this.state.pressure=100;this.state.filter=0;
   add('inner','SEAL INNER DOOR',0,{row:1});add('drain','HOLD E / VENT CHAMBER',1,{row:5});add('filter','HOLD E / STERILIZE',2,{row:6});add('outer','OPEN OUTER DOOR',3,{row:1});
  }else if(kind==='crane'){
   this.state={hook:4,carried:null,crates:[0,2],delivered:[],pads:[6,8]};
   for(const [i,[action,label]]of [['north','CRANE NORTH'],['west','CRANE WEST'],['east','CRANE EAST'],['south','CRANE SOUTH'],['hook','RAISE / LOWER HOOK']].entries())add(action,label,i,{row:3});
  }else if(kind==='memory'){
   this.state.sequence=[world.seed%4,2,(world.seed+1)%4,3,0];this.state.entered=0;this.state.playUntil=0;
   add('play','REPLAY RECORDED SIGNAL',0,{row:7});for(let i=0;i<4;i++)add('note-'+i,'REPEAT SIGNAL',i+1,{slot:i,row:4,tint:palette[i]});
  }else if(kind==='plates'){
   this.state.order=[0,1,4,3,6,7,8];this.state.progress=0;this.state.last=-1;this.state.armed=false;
   for(let i=0;i<9;i++)add('plate-'+i,'WALK THE LIT SENSOR ROUTE',i,{slot:i,row:7,plate:true});
  }else if(kind==='loadshare'){
   this.state.loads=[6,0,0];this.state.target=[2,1,3];
   for(let i=0;i<3;i++)add('transfer-'+i,'TRANSFER ONE CELL CLOCKWISE',i,{slot:i,row:1});
  }else if(kind==='thermal'){
   this.state.temperature=80;this.state.stable=0;
   add('cool','HOLD E / COOLANT INJECTION',0,{row:5});add('heat','HOLD E / HEATER TRIM',2,{row:6});
  }else if(kind==='quarantine'){
   this.state.carried=null;this.state.delivered=[];
   for(let i=0;i<3;i++){const room=world.rooms.find(r=>r.id===['west','east','upper'][i]);add('sample-'+i,'RECOVER '+['BROOD','CHOIR','SPLICE'][i]+' SAMPLE',i,{...nearbyFloor(world,{x:room.center.x-4,z:room.center.z+4,y:room.y}),slot:i,row:0,tint:palette[i]});add('chamber-'+i,'ISOLATION CHAMBER '+(i+1),i+3,{slot:i,row:6,tint:palette[i]});}
  }else if(kind==='spectrum'){
   this.state.filters=[false,false,false];this.state.channel=0;this.state.targets=[6,5,7];
   for(let i=0;i<3;i++)add('filter-'+i,'TOGGLE '+colors[i]+' FILTER',i,{slot:i,row:3,tint:['#ff706b','#85ef87','#80b7ff'][i]});add('transmit','TEST EMERGENCY CHANNEL',3,{row:7});
  }else if(kind==='dispatch'){
   this.state.step=0;this.state.remaining=0;
   for(let i=0;i<3;i++){const room=world.rooms.find(r=>r.id===['upper','cross','armory'][i]);add('breaker-'+i,'SHUT DOWN DISPATCH RELAY '+(i+1),i,{...nearbyFloor(world,{x:room.center.x,z:room.center.z+4,y:room.y}),slot:i,row:4});}
   let distance=0;for(let i=1;i<3;i++){const a=this.nodes[i-1],b=this.nodes[i],route=world.waypoint(a.x,a.z,b.x,b.z,{startY:a.y,endY:b.y,fullPath:true});distance+=(route?.length||80)*2;}
   this.state.limit=Math.ceil(distance/5+24);
  }
 }
 visible(n){return !(this.kind==='quarantine'&&n.action.startsWith('sample')&&(this.state.carried===n.slot||this.state.delivered.includes(n.slot)));}
 use(id){const n=this.nodes.find(n=>n.id===id);if(!n||this.solved||!this.visible(n))return{accepted:false};const s=this.state,a=n.action,i=n.slot;let wrong=false,message='';
  if(this.kind==='circuit'){for(const k of[i-1,i,i+1])if(k>=0&&k<5)s.bits[k]=!s.bits[k];this.solved=s.bits.every(Boolean);}
  if(this.kind==='cargo'){const empty=s.board.indexOf(0);if(manhattan(i,empty)!==1)return{accepted:false,message:'MOVE A CONTAINER NEXT TO THE EMPTY BAY'};[s.board[i],s.board[empty]]=[s.board[empty],s.board[i]];this.solved=s.board.every((v,j)=>v===(j+1)%9);}
  if(this.kind==='frequency'){s.dials[i]=(s.dials[i]+1)%10;this.solved=s.dials.every((v,j)=>v===s.target[j]);}
  if(this.kind==='airlock'){
   if(a==='inner'){s.step=1;s.pressure=100;s.filter=0;}
   if(a==='drain')message=s.step===1?'HOLD E UNTIL PRESSURE IS ZERO':'SEAL THE INNER DOOR FIRST';
   if(a==='filter')message=s.step===2?'HOLD E TO STERILIZE':'VENT THE CHAMBER FIRST';
   if(a==='outer'){if(s.step===3)this.solved=true;else{wrong=true;s.step=0;s.pressure=100;s.filter=0;message='SAFETY RESET / SEAL, VENT, STERILIZE, OPEN';}}
  }
  if(this.kind==='crane'){
   const delta={north:-3,south:3,west:-1,east:1}[a];
   if(delta!==undefined){const next=s.hook+delta;if(next>=0&&next<9&&manhattan(next,s.hook)===1)s.hook=next;else message='CRANE AT TRAVEL LIMIT';}
   if(a==='hook'){if(s.carried===null){const crate=s.crates.findIndex((pos,j)=>pos===s.hook&&!s.delivered.includes(j));if(crate>=0){s.carried=crate;s.crates[crate]=-1;}else message='NO CARGO BELOW HOOK';}else{const carried=s.carried;if(s.hook===s.pads[carried]){s.delivered.push(carried);s.crates[carried]=-2;s.carried=null;}else if(!s.crates.includes(s.hook)){s.crates[carried]=s.hook;s.carried=null;}else message='BAY OCCUPIED';}this.solved=s.delivered.length===2;}
  }
  if(this.kind==='memory'){
   if(a==='play'){s.entered=0;s.playUntil=this.clock+s.sequence.length*.85+.3;}
   else if(this.clock<s.playUntil)return{accepted:false,message:'LISTEN TO THE WHOLE RECORDING'};
   else if(i===s.sequence[s.entered]){s.entered++;this.solved=s.entered===s.sequence.length;}
   else{s.entered=0;wrong=true;message='SIGNAL MISMATCH / REPLAY AVAILABLE';}
  }
  if(this.kind==='plates')message='FOLLOW THE NUMBERS ON FOOT / START AT 1';
  if(this.kind==='loadshare'){if(s.loads[i]>0){s.loads[i]--;s.loads[(i+1)%3]++;}else message='THIS CIRCUIT HAS NO SPARE CELL';this.solved=s.loads.every((v,j)=>v===s.target[j]);}
  if(this.kind==='thermal')message='HOLD 38–44 DEGREES FOR THREE SECONDS';
  if(this.kind==='quarantine'){
   if(a.startsWith('sample')){if(s.carried!==null)return{accepted:false,message:'ONE SAMPLE AT A TIME / USE ITS MATCHING CHAMBER'};s.carried=i;}
   else if(s.carried===i){s.delivered.push(i);s.carried=null;this.solved=s.delivered.length===3;}
   else{wrong=true;message='SPECIMEN MISMATCH / '+['BROOD','CHOIR','SPLICE'][i]+' ONLY';}
  }
  if(this.kind==='spectrum'){
   if(a.startsWith('filter'))s.filters[i]=!s.filters[i];else if(this.spectrum===s.targets[s.channel]){s.channel++;this.solved=s.channel===3;s.filters=[false,false,false];}else{wrong=true;message='CHANNEL REJECTED / MATCH THE RECEIVER COLOR';}
  }
  if(this.kind==='dispatch'){
   if(i===0){s.step=1;s.remaining=s.limit;}
   else if(s.remaining>0&&i===s.step){s.step++;this.solved=s.step===3;}else{wrong=true;message='START AT RELAY 1 / FOLLOW THE SERVICE ROUTE';}
  }
  return{accepted:!wrong,changed:true,wrong,message:this.solved?'SYSTEM RESTORED':message||this.objective()};
 }
 get spectrum(){return this.state.filters?.reduce((v,on,i)=>v+(on?1<<i:0),0)||0;}
 tick(dt,helpers=[]){this.clock+=dt;if(this.solved)return;const s=this.state,held=action=>{const n=this.nodes.find(n=>n.action===action);return helpers.some(p=>p.hp>0&&p.revive&&Math.abs(p.y-n.y)<.6&&Math.hypot(p.x-n.x,p.z-n.z)<3&&this.world.los(p.x,p.z,n.x,n.z,p.y+1,n.y+1));};
  if(this.kind==='airlock'){if(s.step===1&&held('drain')){s.pressure=Math.max(0,s.pressure-dt*30);if(s.pressure===0)s.step=2;}if(s.step===2&&held('filter')){s.filter=Math.min(2,s.filter+dt);if(s.filter===2)s.step=3;}}
  if(this.kind==='thermal'){s.temperature=Math.max(0,Math.min(100,s.temperature+dt*(held('cool')?-10:held('heat')?7:1.2)));s.stable=s.temperature>=38&&s.temperature<=44?s.stable+dt:0;this.solved=s.stable>=3;}
  if(this.kind==='dispatch'&&s.remaining>0){s.remaining=Math.max(0,s.remaining-dt);if(!s.remaining)s.step=0;}
  if(this.kind==='plates'){
   const occupied=this.nodes.filter(n=>helpers.some(p=>p.hp>0&&Math.abs(p.y-n.y)<.5&&Math.hypot(p.x-n.x,p.z-n.z)<1.15));
   for(const n of occupied){if(n.slot===s.last)continue;s.last=n.slot;if(n.slot===s.order[s.progress]){s.progress++;s.armed=true;this.solved=s.progress===s.order.length;}else if(n.slot===s.order[0]){s.progress=1;s.armed=true;}else{s.progress=0;s.armed=false;}}
   if(!occupied.length)s.last=-1;
  }
 }
 get progressKey(){const s=this.state;return this.kind==='dispatch'?s.step:this.kind==='quarantine'?s.delivered.length+':'+s.carried:this.kind==='airlock'?s.step:this.kind==='memory'?s.entered:this.kind==='plates'?s.progress:this.kind==='spectrum'?s.channel:'';}
 goal(player){const s=this.state;
  if(this.kind==='airlock')return this.nodes[s.step];
  if(this.kind==='thermal')return this.nodes[s.temperature<38?1:0];
  if(this.kind==='quarantine'){if(s.carried!==null)return this.nodes.find(n=>n.action==='chamber-'+s.carried);const missing=this.nodes.filter(n=>n.action.startsWith('sample')&&!s.delivered.includes(n.slot));return nearestRoute(this.world,player,missing);}
  if(this.kind==='dispatch')return this.nodes[Math.min(s.step,2)];
  if(this.kind==='plates')return this.nodes[s.order[Math.min(s.progress,6)]];
  if(this.kind==='frequency')return this.nodes.find(n=>s.dials[n.slot]!==s.target[n.slot])||this.nodes[0];
  return nearestRoute(this.world,player,this.nodes);
 }
 objective(){const s=this.state,name=PUZZLE_NAMES[this.kind];if(this.solved)return'SYSTEM RESTORED';return name+(this.kind==='dispatch'&&s.remaining>0?' / '+Math.ceil(s.remaining)+'s':this.kind==='quarantine'?' / '+s.delivered.length+'/3':this.kind==='memory'?' / '+s.entered+'/5':this.kind==='plates'?' / '+s.progress+'/7':'');}
 readout(n){const s=this.state,i=n.slot;if(this.solved)return'SYSTEM\nRESTORED';
  if(this.kind==='circuit')return'FUSE '+(i+1)+' '+(s.bits[i]?'ON':'OFF')+'\nE FLIPS NEIGHBORS\nALL FIVE MUST LIGHT';
  if(this.kind==='cargo')return(s.board[i]?'CONTAINER '+s.board[i]:'EMPTY BAY')+'\n'+s.board.slice(0,3).join(' ')+' / '+s.board.slice(3,6).join(' ')+'\nORDER 1–8 / EMPTY LAST';
  if(this.kind==='frequency')return'TUNE '+['A','B','C'][i]+'  '+s.dials[i]+' / '+s.target[i]+'\n'+s.dials.map((v,j)=>v===s.target[j]?'LOCK':'BEAT').join(' ')+'\nE +1 / 9 WRAPS TO 0';
  if(this.kind==='airlock')return['SEAL INNER','HOLD E / VENT','HOLD E / FILTER','OPEN OUTER'][n.index]+'\n'+Math.ceil(s.pressure)+' kPa / FILTER '+Math.round(s.filter/2*100)+'%\n'+['1 SEAL','2 VENT','3 STERILIZE','4 OPEN'][s.step];
  if(this.kind==='crane'){const board=Array(9).fill('·');s.pads.forEach((v,j)=>board[v]=j?'B':'A');s.crates.forEach((v,j)=>{if(v>=0)board[v]=j?'b':'a';});board[s.hook]=s.carried===null?'+':'*';return n.label+'\n'+board.slice(0,3).join(' ')+' / '+board.slice(3,6).join(' ')+' / '+board.slice(6).join(' ')+'\nLOWER a ON A / b ON B';}
  if(this.kind==='memory')return(n.action==='play'?'REPLAY RECORDING':'TONE '+(i+1))+'\n'+(this.clock<s.playUntil?'LISTEN / WATCH LAMPS':'REPEAT '+s.entered+' / 5')+'\nE / REPLAY RESETS INPUT';
  if(this.kind==='plates')return'SENSOR '+(i+1)+'\n'+(s.order.indexOf(i)<0?'DO NOT STEP': 'STEP '+(s.order.indexOf(i)+1))+'\n'+s.progress+' / 7';
  if(this.kind==='loadshare')return'CIRCUIT '+(i+1)+' / '+s.loads[i]+' OF '+s.target[i]+'\nE SENDS ONE TO '+((i+1)%3+1)+'\nTARGET LOADS 2 : 1 : 3';
  if(this.kind==='thermal')return(n.action==='cool'?'HOLD E / COOL':'HOLD E / HEAT')+'\n'+Math.round(s.temperature)+'° / TARGET 38–44\nSTABLE '+s.stable.toFixed(1)+' / 3s';
  if(this.kind==='quarantine')return(n.action.startsWith('sample')?'SAMPLE ':'CHAMBER ')+['BROOD','CHOIR','SPLICE'][i]+'\n'+(s.delivered.includes(i)?'ISOLATED':s.carried===i?'CARRYING SAMPLE':'MATCH SPECIMEN')+'\n'+s.delivered.length+' / 3 CONTAINED';
  if(this.kind==='spectrum')return(n.action==='transmit'?'TEST CHANNEL '+(s.channel+1):colors[i]+' '+(s.filters[i]?'ON':'OFF'))+'\nTARGET '+({6:'CYAN (G+B)',5:'MAGENTA (R+B)',7:'WHITE (R+G+B)'}[s.targets[s.channel]])+'\n'+s.channel+' / 3 ISOLATED';
  return'DISPATCH RELAY '+(i+1)+'\n'+(s.remaining>0?Math.ceil(s.remaining)+'s / NEXT '+(s.step+1):'START 1 → 2 → 3')+'\nRELAY 1 RESTARTS CLOCK';
 }
 active(n){const s=this.state;if(this.solved)return true;if(this.kind==='circuit')return s.bits[n.slot];if(this.kind==='frequency')return s.dials[n.slot]===s.target[n.slot];if(this.kind==='spectrum')return s.filters[n.slot];if(this.kind==='plates')return s.order.indexOf(n.slot)<s.progress&&s.order.includes(n.slot);if(this.kind==='memory'&&this.clock<s.playUntil){const start=s.playUntil-s.sequence.length*.85-.3,elapsed=this.clock-start;return n.slot===s.sequence[Math.floor(elapsed/.85)]&&mod(elapsed,.85)<.55;}return false;}
 snapshot(){return{kind:this.kind,clock:this.clock,solved:this.solved,state:clone(this.state)};}
 restore(s){if(s?.kind!==this.kind)return;this.clock=s.clock||0;this.solved=!!s.solved;this.state=clone(s.state);}
}
const goalCache=new WeakMap();
function nearestRoute(world,player,nodes){
 // The closest object on the map may be on an entirely different deck.
 const key=[Math.floor(player.x/2),Math.floor(player.z/2),Math.round(player.y*2),...nodes.map(n=>n.id)].join(':');let cache=goalCache.get(world);if(!cache){cache=new Map();goalCache.set(world,cache);}if(cache.has(key))return cache.get(key);
 let best=nodes[0],distance=Infinity;for(const n of nodes){const route=world.waypoint(player.x,player.z,n.x,n.z,{startY:player.y,endY:n.y,fullPath:true,includeLifts:true});const d=route?route.length:Infinity;if(d<distance){best=n;distance=d;}}if(cache.size>64)cache.clear();cache.set(key,best);return best;
}
export class ChapterTasks{
 constructor(world,chapter,Legacy){this.world=world;this.chapter=chapter;this.systems=CHAPTER_PUZZLES[chapter%12].map(kind=>{if(NEW_PUZZLES.includes(kind))return new PuzzleSystem(world,kind,chapter);const t=new Legacy(world,['pressure','mirrors','timing','coolant'].indexOf(kind));t.powered=true;t.taken=t.fuses.map(n=>n.id);t.nodes=t.nodes.filter(n=>!['coupler','socket'].includes(n.kind));return t;});this.nodes=this.systems.flatMap(t=>t.nodes);this.taken=[];this.powered=true;}
 get current(){return this.systems.find(t=>!t.solved)||this.systems.at(-1);}
 get kind(){return this.current.kind;}
 get solved(){return this.systems.every(t=>t.solved);}
 get stage(){return this.systems.findIndex(t=>!t.solved);}
 get clock(){return this.current.clock;}
 set clock(v){this.current.clock=v;}
 stateFor(n){return this.systems.find(t=>t.nodes.includes(n));}
 visible(n){const t=this.stateFor(n);return this.systems.indexOf(t)<=(this.stage<0?this.systems.length:this.stage)&&(t.solved||t.visible(n));}
 interactable(n){return this.stateFor(n)===this.current&&!this.solved&&this.current.visible(n);}
 use(id){return this.current.use(id);}
 tick(dt,helpers){if(!this.solved)this.current.tick(dt,helpers);}
 goal(p){if(this.solved)return null;return this.current.goal(p);}
 objective(){return this.current.objective();}
 snapshot(){return{version:3,chapter:this.chapter,kind:this.kind,stage:this.stage,solved:this.solved,systems:this.systems.map(t=>t.snapshot())};}
 restore(s){if(s?.version===3)s.systems?.forEach((value,i)=>this.systems[i]?.restore(value));}
}
