import{ChapterTasks}from'./puzzle-systems.js';
const mod=(n,m)=>(n%m+m)%m;
export function traceMirrors(orientations){
 const mirrors=[[1,2],[1,0],[3,0],[3,4]],directions=[[1,0],[0,1],[-1,0],[0,-1]],segments=[];let x=0,z=2,dir=0,anchor={x,z};
 for(let i=0;i<35;i++){const[dx,dz]=directions[dir];x+=dx;z+=dz;if(x<0||z<0||x>4||z>4){segments.push({from:anchor,to:{x,z}});return{segments,solved:false};}if(x===4&&z===4){segments.push({from:anchor,to:{x,z}});return{segments,solved:true};}const m=mirrors.findIndex(p=>p[0]===x&&p[1]===z);if(m>=0){segments.push({from:anchor,to:{x,z}});anchor={x,z};dir=orientations[m]?[1,0,3,2][dir]:[3,2,1,0][dir];}}
 return{segments,solved:false};
}
export class LegacyTasks{
 constructor(world,chapter=0){
  this.world=world;this.chapter=chapter;this.clock=0;this.powered=false;this.solved=false;this.kind=['pressure','mirrors','timing','coolant'][chapter%4];this.taken=[];this.valves=[false,false,false];this.target=3+(world.seed%4);this.mirrors=[1,1,0,0];this.sync=0;this.charge=0;this.remaining=0;
  const room=id=>world.rooms.find(r=>r.id===id).center,w=room('west'),e=room('east'),u=room('upper'),c=room('cross');
  this.fuses=[{id:'coupler-a',kind:'coupler',label:'RECOVERY COUPLER',x:w.x-7,z:w.z+5,y:w.y},{id:'coupler-b',kind:'coupler',label:'RECOVERY COUPLER',x:e.x+4,z:e.z-5,y:e.y}];
  if(world.overpass?.goal&&chapter>0)Object.assign(this.fuses[chapter%2],world.overpass.goal);
  this.socket={id:'coupler-socket',kind:'socket',label:'INSERT TWO COUPLERS',x:u.x,z:u.z+5,y:u.y};this.nodes=[...this.fuses,this.socket];
  if(this.kind==='pressure')for(let i=0;i<3;i++)this.nodes.push({id:'pressure-'+i,kind:'pressure',index:i,label:'VALVE +'+(1<<i),x:c.x-4+i*4,z:c.z+6,y:c.y});
  if(this.kind==='mirrors'){this.beamOrigin={x:c.x-5,z:c.z+1,y:c.y+1.4};for(const [i,p]of [[1,2],[1,0],[3,0],[3,4]].entries())this.nodes.push({id:'mirror-'+i,kind:'mirror',index:i,label:'ROTATE REFLECTOR',x:this.beamOrigin.x+p[0]*2,z:this.beamOrigin.z+p[1]*2,y:c.y});}
  if(this.kind==='timing')for(let i=0;i<3;i++)this.nodes.push({id:'sync-'+i,kind:'sync',index:i,label:'SYNC '+(i+1),x:c.x-4+i*4,z:c.z+6,y:c.y});
  if(this.kind==='coolant'){this.pump={id:'coolant-pump',kind:'pump',label:'HOLD E / PRESSURIZE',x:e.x-3,z:e.z+4,y:e.y};this.receiver={id:'coolant-return',kind:'return',label:'RETURN VALVE',x:u.x+4,z:u.z-4,y:u.y};this.nodes.push(this.pump,this.receiver);this.transferTime=Math.max(28,Math.hypot(e.x-u.x,e.z-u.z)/6+12);}
  // Place mission devices on accessible floor; never inside a column or pit.
  for(const node of this.nodes)if(!world.canMove(node.x,node.z,.7,node.y)){for(let d=1;d<12;d++){let found=false;for(const[dx,dz]of [[d,0],[-d,0],[0,d],[0,-d]])if(world.canMove(node.x+dx,node.z+dz,.7,node.y)){node.x+=dx;node.z+=dz;found=true;break;}if(found)break;}}
 }
 get pressure(){return this.valves.reduce((sum,v,i)=>sum+(v?1<<i:0),0);}
 get phase(){return mod(this.clock,2.4)/2.4;}
 get windowOpen(){return Math.abs(this.phase-[.18,.5,.82][this.sync])<.105;}
 visible(node){return node.kind==='coupler'?!this.taken.includes(node.id):node.kind==='socket'?!this.powered:this.powered&&!this.solved;}
 use(id){const n=this.nodes.find(n=>n.id===id);if(!n||!this.visible(n))return{accepted:false};
  if(n.kind==='coupler'){this.taken.push(n.id);return{accepted:true,changed:true,message:'COUPLER RECOVERED / '+this.taken.length+' OF 2'};}
  if(n.kind==='socket'){if(this.taken.length<2)return{accepted:false,message:'TWO RECOVERY COUPLERS REQUIRED'};this.powered=true;return{accepted:true,changed:true,message:'AUXILIARY CIRCUIT POWERED'};}
  if(n.kind==='pressure'){this.valves[n.index]=!this.valves[n.index];this.solved=this.pressure===this.target;return{accepted:true,changed:true,message:this.solved?'PRESSURE BALANCED':`PRESSURE ${this.pressure} / TARGET ${this.target}`};}
  if(n.kind==='mirror'){this.mirrors[n.index]^=1;this.solved=traceMirrors(this.mirrors).solved;return{accepted:true,changed:true,message:this.solved?'OPTICAL LINK RESTORED':'REFLECTOR ROTATED'};}
  if(n.kind==='sync'){if(n.index===this.sync&&this.windowOpen){this.sync++;this.solved=this.sync===3;return{accepted:true,changed:true,message:this.solved?'PHASES SYNCHRONIZED':'PHASE LOCKED'};}this.sync=0;return{accepted:true,changed:true,wrong:true,message:'SYNC RESET / ACTIVATE ON GREEN'};}
  if(n.kind==='pump')return{accepted:true,message:'HOLD E TO PRESSURIZE'};
  if(n.kind==='return'){if(this.remaining<=0)return{accepted:false,message:'PRESSURIZE THE DEPOT PUMP FIRST'};this.solved=true;return{accepted:true,changed:true,message:'COOLANT LOOP STABILIZED'};}
  return{accepted:false};
 }
 tick(dt,helpers=[]){this.clock+=dt;if(this.kind!=='coolant'||!this.powered||this.solved)return;
  if(this.remaining>0){this.remaining=Math.max(0,this.remaining-dt);if(!this.remaining)this.charge=0;return;}
  const holding=helpers.some(p=>p.revive&&p.hp>0&&Math.hypot(p.x-this.pump.x,p.z-this.pump.z,p.y-this.pump.y)<3.2);
  this.charge=holding?Math.min(3,this.charge+dt):Math.max(0,this.charge-dt*2);if(this.charge>=3)this.remaining=this.transferTime;
 }
 goal(player){if(!this.powered){const missing=this.fuses.filter(n=>!this.taken.includes(n.id));return missing.length?missing.sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))[0]:this.socket;}if(this.solved)return null;if(this.kind==='coolant')return this.remaining>0?this.receiver:this.pump;return this.nodes.find(n=>['pressure','mirror','sync'].includes(n.kind)&&(!Number.isInteger(n.index)||this.kind!=='timing'||n.index===this.sync));}
 objective(){return!this.powered?(this.taken.length<2?'RECOVER COUPLERS '+this.taken.length+'/2':'INSTALL RECOVERY COUPLERS'):this.solved?'AUXILIARY SYSTEM READY':this.kind==='pressure'?`BALANCE PRESSURE ${this.pressure}/${this.target}`:this.kind==='mirrors'?'ALIGN THE OPTICAL LINK':this.kind==='timing'?'SYNCHRONIZE PHASES '+this.sync+'/3':this.remaining>0?'REACH RETURN VALVE / '+Math.ceil(this.remaining)+'s':'PRESSURIZE COOLANT PUMP';}
 snapshot(){return{chapter:this.chapter,clock:this.clock,powered:this.powered,solved:this.solved,taken:[...this.taken],valves:[...this.valves],mirrors:[...this.mirrors],sync:this.sync,charge:this.charge,remaining:this.remaining};}
 restore(s){if(!s)return;for(const k of ['clock','powered','solved','taken','valves','mirrors','sync','charge','remaining'])if(s[k]!==undefined)this[k]=structuredClone(s[k]);}
}
export class MissionTasks{
 constructor(world,chapter=0){return world.layoutVersion===3?new ChapterTasks(world,chapter,LegacyTasks):new LegacyTasks(world,chapter);}
}
