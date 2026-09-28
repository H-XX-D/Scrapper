import{extendWorld}from'./world-complexity.js';
import{chapterConfiguration}from'./chapter-layouts.js';
export const TILE=2;
export function rng(seed){let a=Number(seed)>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const key=(x,z)=>`${x},${z}`;
const configurations=[
 {name:'DOCK NINE',rooms:[
  ['arrival','RECEIVING',42,138,15,12,0,10],['hall','FREIGHT CONCOURSE',42,107,35,24,0,18],
  ['west','CONTAINER YARD',10,102,17,20,0,12],['east','COOLANT DEPOT',78,111,19,17,0,10],
  ['upper','CONTROL GANTRY',9,58,18,16,6,10],['cross','TRANSFER HALL',46,60,25,19,6,14],
  ['armory','SECURE ARMORY',88,63,16,17,6,10],['lock','SECURITY CHECK',49,30,13,10,6,9],
  ['boss','ORBITAL LOADING BAY',49,0,31,23,6,20]],
  links:[['arrival','hall'],['hall','west'],['hall','east'],['west','upper'],['upper','cross'],['east','armory'],['cross','armory'],['hall','cross'],['cross','lock'],['lock','boss']],lift:['east','armory'],landmark:'crane'},
 {name:'VERDANT ARRAY',rooms:[
  ['arrival','QUARANTINE',8,137,15,13,0,8],['hall','BIODOME',43,106,37,31,0,22,'round'],
  ['west','SPECIMEN LAB',-2,80,18,18,4,10],['east','FUNGAL GARDEN',87,110,23,19,0,16,'round'],
  ['upper','OBSERVATION',7,40,20,14,8,9],['cross','ARCHIVE ROTUNDA',50,52,26,22,4,18,'round'],
  ['armory','SURGICAL STORAGE',96,56,16,18,8,10],['lock','STERILIZATION',52,20,14,9,4,8],
  ['boss','LIVING REACTOR',52,-10,33,24,4,24,'round']],
  links:[['arrival','hall'],['hall','west'],['hall','east'],['west','upper'],['upper','cross'],['east','armory'],['cross','armory'],['hall','cross'],['cross','lock'],['lock','boss']],lift:['east','armory'],landmark:'garden'},
 {name:'GLACIER WORKS',rooms:[
  ['arrival','PUMP ACCESS',10,148,17,13,0,8],['hall','DRAINAGE CANYON',43,122,48,17,-6,20],
  ['west','ICE PUMP HOUSE',-8,92,18,20,-6,12],['east','COOLING TOWER',100,120,18,24,0,16],
  ['upper','SERVICE BALCONY',-1,43,20,15,0,9],['cross','FROZEN RESERVOIR',50,66,35,28,-6,22],
  ['armory','COMPRESSOR DECK',105,60,18,19,6,10],['lock','PRESSURE LOCK',50,20,13,11,0,9],
  ['boss','TURBINE VAULT',50,-13,38,22,0,20]],
  links:[['arrival','hall'],['hall','west'],['hall','east'],['west','upper'],['upper','cross'],['east','armory'],['cross','armory'],['hall','cross'],['upper','lock'],['cross','lock'],['lock','boss']],lift:['east','armory'],landmark:'turbine'},
 {name:'CINDER CATHEDRAL',rooms:[
  ['arrival','FURNACE INTAKE',45,149,16,12,0,10],['hall','SMELTER NAVE',45,117,33,28,0,24],
  ['west','SLAG WORKS',-4,106,18,23,0,16],['east','CASTING FLOOR',97,115,23,19,0,15],
  ['upper','CRANE BALCONY',-2,48,20,16,6,13],['cross','REACTOR RING',48,60,34,28,6,26,'round'],
  ['armory','WEAPONS FOUNDRY',103,57,19,18,12,12],['lock','CORE BULKHEAD',48,15,13,11,12,12],
  ['boss','MACHINE CHOIR',48,-20,38,26,12,28]],
  links:[['arrival','hall'],['hall','west'],['hall','east'],['west','upper'],['upper','cross'],['east','armory'],['cross','armory'],['hall','cross'],['cross','lock'],['lock','boss']],lift:['east','armory'],landmark:'reactor'}
];
export function makeWorld(seed=2709,theme=0,chapter=null){
 const random=rng(seed),config=chapter===null?configurations[theme%4]:chapterConfiguration(chapter,configurations[theme%4]),cells=new Map(),rooms=[],stairs=[],lifts=[],gates=[],secrets=[],switches=[],props=[],signs=[],encounters=[],supplies=[];
 const put=(x,z,y=0,room='passage',extra={})=>{const c={x,z,y,ceiling:y+3.6,room,gap:false,...extra};cells.set(key(x,z),c);return c;};
 const point=(x,z,y=0)=>({x:x*TILE+1,z:z*TILE+1,y});
 const rect=(x1,z1,x2,z2,y,room,extra={})=>{for(let z=z1;z<=z2;z++)for(let x=x1;x<=x2;x++)put(x,z,y,room,extra);};
 for(const def of config.rooms){
  const[id,name,rawX,rawZ,rawW,rawD,rawY,height,shape]=def,cx=Math.round(rawX*.63),cz=Math.round(rawZ*.63),w=Math.max(9,Math.round(rawW*.6)),d=Math.max(9,Math.round(rawD*.6)),y=rawY*.5,jitter=['arrival','lock','boss'].includes(id)?0:Math.floor(random()*5)-2;
  const room={id,name,cx:cx+jitter+35,cz:cz+35,w:w+(id==='arrival'?0:Math.floor(random()*3)),d,y,height:id==='boss'?4.6:3.8,shape,style:Math.floor(random()*3)};
  room.x1=room.cx-Math.floor(room.w/2);room.x2=room.cx+Math.floor(room.w/2);room.z1=room.cz-Math.floor(room.d/2);room.z2=room.cz+Math.floor(room.d/2);room.center=point(room.cx,room.cz,y);rooms.push(room);
  for(let z=room.z1;z<=room.z2;z++)for(let x=room.x1;x<=room.x2;x++){
   if(shape==='round'&&((x-room.cx)/(room.w*.55))**2+((z-room.cz)/(room.d*.55))**2>1)continue;
   if(config.profile&&!['arrival','lock','boss','upper','armory'].includes(id)){
    const dx=x-room.cx,dz=z-room.cz,ax=Math.abs(dx),az=Math.abs(dz),hx=Math.floor(room.w/2),hz=Math.floor(room.d/2),style=config.profile.shape;
    // Solid service ribs, cut-in bays and islands alter the traversable room silhouette.
    // The connector pass subsequently cuts real doorways through these walls.
    if(style==='loading'&&dz>hz-4&&ax>2&&Math.abs(dx%5)<2)continue;
    if(style==='alcoves'&&ax>hx-3&&az>1&&Math.abs(dz%5)<2)continue;
    if(style==='channels'&&ax<3&&az<3)continue;
    if(style==='machine'&&ax>=4&&ax<=5&&az>=2&&az<=3)continue;
    if(style==='racks'&&(dx===-4||dx===4)&&az<hz-2)continue;
    if(style==='split'&&dx===-3&&az<hz-2)continue;
    if(style==='garden'&&ax>=4&&ax<=5&&az>=3&&az<=4)continue;
    if(style==='damaged'&&dx>1&&dz>1&&dx+dz>hx+hz-5)continue;
   }
   put(x,z,y,id,{ceiling:y+room.height,style:room.style});
  }
 }
 const byId=Object.fromEntries(rooms.map(r=>[r.id,r]));
 function connect(aId,bId,width=3){
  const a=byId[aId],b=byId[bId];let path=[],dx=b.cx-a.cx,dz=b.cz-a.cz;
  let x=a.cx,z=a.cz;const horizontalFirst=Math.abs(dx)>Math.abs(dz);
  const segment=(tx,tz)=>{while(x!==tx||z!==tz){if(x!==tx)x+=Math.sign(tx-x);else z+=Math.sign(tz-z);path.push({x,z});}};
  if(horizontalFirst){segment(b.cx,a.cz);segment(b.cx,b.cz);}else{segment(a.cx,b.cz);segment(b.cx,b.cz);}
  if(config.profile&&aId!=='boss'&&bId!=='boss'&&path.some(p=>cells.get(key(p.x,p.z))?.room==='boss')){
   // A procedural elbow must not cut a second entrance through the sealed guardian chamber.
   const boss=byId.boss,queue=[{x:a.cx,z:a.cz}],previous=new Map([[key(a.cx,a.cz),null]]),margin=6;
   const bounds={x1:Math.min(...rooms.map(r=>r.x1))-margin,x2:Math.max(...rooms.map(r=>r.x2))+margin,z1:Math.min(...rooms.map(r=>r.z1))-margin,z2:Math.max(...rooms.map(r=>r.z2))+margin};
   let end=null;for(let i=0;i<queue.length;i++){const p=queue[i];if(p.x===b.cx&&p.z===b.cz){end=p;break;}for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const n={x:p.x+dx,z:p.z+dz},k=key(n.x,n.z);if(previous.has(k)||n.x<bounds.x1||n.x>bounds.x2||n.z<bounds.z1||n.z>bounds.z2||n.x>=boss.x1-2&&n.x<=boss.x2+2&&n.z>=boss.z1-2&&n.z<=boss.z2+2)continue;previous.set(k,p);queue.push(n);}}
   if(end){path=[];for(let p=end;p;p=previous.get(key(p.x,p.z)))path.push(p);path.reverse();path.shift();}
  }
  if(aId!=='lock'){
   const bent=[];for(let i=0;i<path.length;i++){const p=path[i];if(cells.has(key(p.x,p.z))){bent.push(p);continue;}let end=i;while(end+1<path.length&&!cells.has(key(path[end+1].x,path[end+1].z)))end++;
    const last=path[end],axis=p.x===last.x?'z':p.z===last.z?'x':null;
    if(axis&&end-i>8){const other=axis==='x'?'z':'x',dir=Math.sign(last[axis]-p[axis]);let cursor={...p};bent.push({...cursor});for(let step=1;step<=end-i;step++){const band=Math.floor(step/5),offset=step>end-i-3?0:[0,2,-2,1][band%4],targetOther=p[other]+offset;while(cursor[other]!==targetOther){cursor[other]+=Math.sign(targetOther-cursor[other]);bent.push({...cursor});}cursor[axis]+=dir;bent.push({...cursor});}while(cursor[other]!==last[other]){cursor[other]+=Math.sign(last[other]-cursor[other]);bent.push({...cursor});}}
    else bent.push(...path.slice(i,end+1));i=end;
   }path=bent;
  }
  const free=path.filter(p=>!cells.has(key(p.x,p.z)));
  // Each new corridor segment joins the actual heights at its two ends. Existing junctions remain fixed.
  for(let i=0;i<path.length;i++){
   if(cells.has(key(path[i].x,path[i].z)))continue;
   let end=i;while(end+1<path.length&&!cells.has(key(path[end+1].x,path[end+1].z)))end++;
   const before=path[Math.max(0,i-1)],after=path[Math.min(path.length-1,end+1)];
   const from=cells.get(key(before.x,before.z))?.y??a.y,to=cells.get(key(after.x,after.z))?.y??b.y,count=end-i+1,rise=to-from;
   const steps=Math.min(count,Math.max(1,Math.ceil(Math.abs(rise)/.4))),stairStart=Math.max(0,Math.floor((count-steps)/2));
   for(let k=0;k<count;k++){
    const p=path[i+k],prev=path[Math.max(0,i+k-1)],axis=p.x!==prev.x?'x':'z',dir=Math.sign(p[axis]-prev[axis])||1;
    const progress=Math.max(0,Math.min(1,(k-stairStart+1)/steps)),y=from+rise*progress;
    const stair=rise!==0&&k>=stairStart&&k<stairStart+steps?{axis,dir,from:y-rise/steps,to:y}:null;
    for(let n=-Math.floor(width/2);n<=Math.floor(width/2);n++){const px=p.x+(axis==='z'?n:0),pz=p.z+(axis==='x'?n:0);if(!cells.has(key(px,pz)))put(px,pz,stair?Math.min(stair.from,stair.to):y,'passage',{ceiling:Math.max(y,stair?.from??y,stair?.to??y)+3.6,stair,link:`${aId}:${bId}`});}
    if(stair)stairs.push({x:p.x,z:p.z,...stair,width});
   }
   i=end;
  }
  for(let i=1;i<path.length-1;i++){const p=path[i],before=path[i-1],after=path[i+1];if(before.x!==after.x&&before.z!==after.z){const c=cells.get(key(p.x,p.z));for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)if(!cells.has(key(p.x+dx,p.z+dz)))put(p.x+dx,p.z+dz,c.y,'passage',{ceiling:c.ceiling});}}
  return{a,b,path,free};
 }
 const links=config.links.map(([a,b])=>connect(a,b));
 if(chapter===null){const optionalLink=random()>.5?['arrival','west']:['arrival','east'];connect(...optionalLink);if(random()>.5)connect('east','cross');}
 function addLift(base,high,index){
  const side=base.id==='west'?-1:1,edge=side<0?base.x1:base.x2,x=edge+side*5,z=base.cz,lo=base.y,hi=Math.max(lo+3,high.y),id='lift-'+index;
  rect(Math.min(edge+side,x-side*2),z-1,Math.max(edge+side,x-side*2),z+1,lo,'lift approach',{ceiling:lo+3.8});
  rect(x-1,z-1,x+1,z+1,lo,'lift shaft',{ceiling:hi+3.8,liftId:id});
  rect(Math.min(x+side*2,x+side*6),z-2,Math.max(x+side*2,x+side*6),z+2,hi,'lift landing',{ceiling:hi+3.8});
  const balcony={id:'lift-deck-'+index,name:'LIFT DECK',cx:x+side*5,cz:z,w:5,d:5,y:hi,height:3.8,x1:Math.min(x+side*2,x+side*6),x2:Math.max(x+side*2,x+side*6),z1:z-2,z2:z+2,center:point(x+side*5,z,hi)};byId[balcony.id]=balcony;
  connect(balcony.id,high.id);
  const l={id,x1:(x-1)*2,x2:(x+2)*2,z1:(z-1)*2,z2:(z+2)*2,x:x*2+1,z:z*2+1,low:lo,high:hi,y:lo,previousY:lo,wait:2.5,speed:1.7,direction:1};lifts.push(l);return l;
 }
 addLift(byId[config.lift[0]],byId[config.lift[1]],0);addLift(byId.west,byId.upper,1);
 const finalLink=links.at(-1),doorCell=finalLink.free[Math.floor(finalLink.free.length*.6)]||finalLink.path[Math.floor(finalLink.path.length/2)];
 function gate(id,x,z,axis,width,y,extra={}){
  const g={id,...point(x,z,y),axis,width,open:false,amount:0,remaining:0,...extra};gates.push(g);
  for(let n=-Math.floor(width/2);n<=Math.floor(width/2);n++){const cx=x+(axis==='z'?n:0),cz=z+(axis==='x'?n:0);const c=cells.get(key(cx,cz))||put(cx,cz,y,'door',{ceiling:y+3.8});c.gate=id;}
  return g;
 }
 const doorIndex=finalLink.path.findIndex(p=>p.x===doorCell.x&&p.z===doorCell.z),doorBefore=finalLink.path[Math.max(0,doorIndex-1)],doorAxis=doorBefore.x!==doorCell.x?'x':'z';
 gate('security',doorCell.x,doorCell.z,doorAxis,3,byId.lock.y,{label:'SECURITY BULKHEAD'});
 const switchRoom=byId.cross,order=[0,1,2];for(let i=2;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 const puzzle={order,input:[],solved:false,failures:0,required:chapter===null||[0,4,8].includes(chapter)};
 for(let i=0;i<3;i++)switches.push({id:'relay-'+i,index:i,...point(switchRoom.cx-3+i*3,switchRoom.cz+2,switchRoom.y),on:false});
 const cardRoom=byId.west,accessCard={...point(cardRoom.cx-2,cardRoom.cz-2,cardRoom.y),taken:false};
 const clue={...point(switchRoom.cx,switchRoom.cz-2,switchRoom.y),text:'POWER ROUTE  '+order.map(i=>i+1).join(' > ')};
 function secretRoom(id,base,direction,timed=false){
  const edge=direction<0?base.x1:base.x2,x=edge+direction*9,z=timed&&chapter!==null?base.z2+4:base.cz+4,y=base.y;
  if(timed&&chapter!==null)rect(edge-1,base.z2,edge+1,z,y,'secret approach',{ceiling:y+3.6});
  rect(Math.min(edge,x),z-1,Math.max(edge,x),z+1,y,'secret approach',{ceiling:y+3.6});
  rect(x-3,z-4,x+3,z+4,y,'secret-'+id,{ceiling:y+3.6});
  const entrance=edge+direction*3,g=gate(id,entrance,z,'x',3,y,{secret:true,timed,inward:direction,label:timed?'SERVICE SHUTTER':'LOOSE WALL PANEL'});
  const s={id,gate:g.id,...point(x,z,y),found:false,room:'secret-'+id,timed};secrets.push(s);
  if(timed)switches.push({id:'timer',...point(base.cx,base.cz+3,y),timedGate:id});
  return s;
 }
 const hidden=secretRoom('cache',byId.upper,-1),timed=secretRoom('service',byId.east,1,true);
 const gapLink=links.find(l=>l.a.id==='hall'&&l.b.id==='cross'),gp=gapLink?.free.find(p=>{const c=cells.get(key(p.x,p.z));return c&&!c.stair&&!c.liftId&&p.z>byId.cross.z2+3;});
 const gap=gp?point(gp.x,gp.z,cells.get(key(gp.x,gp.z)).y):{...byId.hall.center};
 if(gp)for(let n=-1;n<=1;n++){const p=cells.get(key(gp.x+n,gp.z));if(p&&!p.stair){p.gap=true;p.pit=-22;}}
 const positions={arc:byId.hall,frost:byId.east,beam:byId.upper,rockets:byId.armory,flame:byId.boss};
 const cases=Object.entries(positions).map(([gun,r],i)=>({...point(r.cx+(i%2?3:-3),r.cz+(i%2?2:-2),r.y),gun,locked:gun==='rockets',room:r.id}));
 cases.push({...hidden,gun:'blades',secret:'cache',room:hidden.room});
 for(const r of rooms){
  signs.push({...point(r.cx,r.z2,r.y),text:r.name});
  if(r.id==='arrival')continue;
  const roster=[['beetle','crawler','drone','tank','splitter','lancer','spitter','bomber','warden'],['spitter','worm','priest','jelly','splitter','leech','bat','beetle'],['jelly','shardling','bat','leech','scorpion','crawler','warden'],['drone','spider','tank','bomber','scorpion','lancer','beetle']][theme],ri=rooms.indexOf(r),family=roster[(ri*2)%roster.length];
  if(r.id==='boss')encounters.push({...point(r.cx,r.cz-2,r.y),type:theme===3?'parallax':theme===0?'matriarch':'overseer'});
  else{encounters.push({...point(r.cx+4,r.cz-3,r.y),type:r.id==='cross'?(theme%2?'marshal':'guardian'):family});if(r.id!=='lock')encounters.push({...point(r.cx-6,r.cz+2,r.y),type:roster[(ri*2+1)%roster.length]});}
  const ammo=r.id==='hall'?'bolt':Object.entries(positions).find(([,a])=>a===r)?.[0]||'bolt';
  supplies.push({...point(r.cx+Math.floor(r.w*.27),r.cz+Math.floor(r.d*.24),r.y),kind:'ammo',gun:ammo});
  props.push({...point(r.cx+Math.floor(r.w*.3),r.cz,r.y),kind:r.id==='hall'?config.landmark:theme===1?'growth':theme===3?'furnace':'cargo',scale:r.id==='hall'?2:1});
 }
 supplies.push({...timed,kind:'ammo',gun:'beam'},{...timed,x:timed.x+2,kind:'scrap',amount:150});
 const nests=rooms.filter(r=>r.id!=='arrival').flatMap((r,ri)=>Array.from({length:r.id==='lock'?2:5},(_,i)=>{const angle=i*Math.PI*2/5+.3,rx=Math.max(3,r.w*.48),rz=Math.max(3,r.d*.48);return{x:r.center.x+Math.cos(angle)*rx,z:r.center.z+Math.sin(angle)*rz,y:r.y,variant:(i+ri)%3};}));
 const fabricator=point(byId.armory.cx-5,byId.armory.cz+4,byId.armory.y);
 const obstacles=[];
 const obstacle=(x,z,y,w,d,h)=>obstacles.push({x,z,y,w,d,h:Math.min(h,3.4)});
 for(const r of rooms)if(r.id==='hall'||r.id==='boss'){
  const {x,z}=r.center;
  if(config.landmark==='crane')for(const dx of[-13,13])obstacle(x+dx,z-4,r.y,1.6,1.6,12);
  else if(config.landmark==='turbine')for(const dx of[-12,12])obstacle(x+dx,z-4,r.y,7,5,10);
  else if(config.landmark==='reactor')obstacle(x,z-6,r.y,6.5,6.5,15);
  else for(let i=0;i<5;i++){const a=i*Math.PI*2/5;obstacle(x+Math.cos(a)*11,z+Math.sin(a)*11,r.y,4,4,9);}
 }
 for(const p of props){if(p.kind==='cargo')for(let i=0;i<3;i++)obstacle(p.x+i*2.2,p.z+(i%2)*2,p.y,2,2,2);else if(p.kind==='furnace')obstacle(p.x,p.z,p.y,3,3,5);}
 const occupied=(x,y,z,r=0)=>obstacles.some(o=>x>o.x-o.w/2-r&&x<o.x+o.w/2+r&&z>o.z-o.d/2-r&&z<o.z+o.d/2+r&&y<o.y+o.h&&y+1.7>o.y);
 for(const p of [...cases,...nests,...encounters,...supplies]){
  const original=cells.get(key(Math.floor(p.x/2),Math.floor(p.z/2)));if(original&&!original.gap&&Math.abs(original.y-p.y)<.2&&!occupied(p.x,p.y,p.z,.7))continue;
  const wanted=p.room||rooms.find(r=>Math.abs(r.y-p.y)<.2&&Math.hypot(r.center.x-p.x,r.center.z-p.z)<Math.max(r.w,r.d)*1.5)?.id||original?.room,candidates=[];
  for(let dz=-8;dz<=8;dz++)for(let dx=-8;dx<=8;dx++){const c=cells.get(key(Math.floor(p.x/2)+dx,Math.floor(p.z/2)+dz));if(c&&c.room===wanted&&!c.gap&&!occupied(c.x*2+1,c.y,c.z*2+1,1))candidates.push({c,d:dx*dx+dz*dz});}
  candidates.sort((a,b)=>a.d-b.d);if(candidates.length){const c=candidates[0].c;p.x=c.x*2+1;p.z=c.z*2+1;p.y=c.y;}
 }
 const at=(x,z)=>cells.get(key(Math.floor(x/TILE),Math.floor(z/TILE)));
 const gateFor=c=>c?.gate?gates.find(g=>g.id===c.gate):null;
 const cellHeight=(c,x,z)=>{if(!c)return null;if(c.stair){const s=c.stair,t=(((s.axis==='x'?x:z)/TILE)%1+1)%1,u=s.dir>0?t:1-t;return s.from+(s.to-s.from)*Math.ceil(u*4-1e-7)/4;}return c.y;};
 function floor(x,z,feetY=Infinity){const c=at(x,z);if(!c||c.gap)return null;let y=cellHeight(c,x,z);if(c.liftId){const l=lifts.find(v=>v.id===c.liftId);if(l&&l.y<=feetY+.5)y=Math.max(y,l.y);}return y;}
 const solid=(x,z)=>{const c=at(x,z);return Boolean(c)&&(!c.gate||gateFor(c)?.open);};
 function canMove(x,z,r=.3,feetY=Infinity){return[[r,r],[r,-r],[-r,r],[-r,-r]].every(([dx,dz])=>{const c=at(x+dx,z+dz);if(!c||!solid(x+dx,z+dz)||(Number.isFinite(feetY)&&occupied(x+dx,feetY,z+dz)))return false;const f=floor(x+dx,z+dz,feetY);return(f===null||f<=feetY+.51)&&(!Number.isFinite(feetY)||c.ceiling>=feetY+1.8);});}
 function blocked(x,y,z){const c=at(x,z);if(!c||!solid(x,z)||obstacles.some(o=>x>o.x-o.w/2&&x<o.x+o.w/2&&z>o.z-o.d/2&&z<o.z+o.d/2&&y>o.y&&y<o.y+o.h))return true;const f=cellHeight(c,x,z);if((!c.gap&&y<f-.05)||y>c.ceiling)return true;if(c.liftId){const l=lifts.find(v=>v.id===c.liftId);if(y>l.y-.25&&y<l.y)return true;}return false;}
 function los(x,z,tx,tz,y=null,ty=null){const a=at(x,z),b=at(tx,tz);y??=(a?.y||0)+1;ty??=(b?.y||0)+1;const n=Math.ceil(Math.hypot(tx-x,tz-z)/.55);for(let i=1;i<=n;i++)if(blocked(x+(tx-x)*i/n,y+(ty-y)*i/n,z+(tz-z)*i/n))return false;return true;}
 function walkEdge(c,n,dx,dz){const ax=c.x*2+1+dx*.99,az=c.z*2+1+dz*.99,bx=n.x*2+1-dx*.99,bz=n.z*2+1-dz*.99;return Math.abs(cellHeight(c,ax,az)-cellHeight(n,bx,bz))<=.51;}
 function waypoint(x,z,tx,tz,options={}){
  const start=at(x,z),end=at(tx,tz);if(!start||!end)return null;
  const queue=[start],prev=new Map([[key(start.x,start.z),null]]);let found=false;
  for(let i=0;i<queue.length;i++){const c=queue[i];if(c===end){found=true;break;}for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=key(c.x+dx,c.z+dz),n=cells.get(k);if(!n||n.gap||occupied(n.x*2+1,n.y,n.z*2+1,.3)||prev.has(k)||(!options.ignoreGates&&n.gate&&!gateFor(n)?.open))continue;if(!walkEdge(c,n,dx,dz)&&!(options.includeLifts&&(c.liftId||n.liftId)))continue;prev.set(k,c);queue.push(n);}}
  if(!found)return null;if(options.fullPath){const route=[];let n=end;while(n){route.push(point(n.x,n.z,n.y));n=prev.get(key(n.x,n.z));}return route.reverse();}let c=end,p=prev.get(key(c.x,c.z));while(p&&p!==start){c=p;p=prev.get(key(c.x,c.z));}return point(c.x,c.z,c.y);
 }
 function useSwitch(id){const s=switches.find(s=>s.id===id);if(!s)return{accepted:false};if(s.timedGate){const g=gates.find(g=>g.id===s.timedGate);g.open=true;g.remaining=12;return{accepted:true,message:'SERVICE SHUTTER · 12 SECONDS'};}
  if(puzzle.solved)return{accepted:false,message:'GRID ONLINE'};
  if(s.index===puzzle.order[puzzle.input.length]){puzzle.input.push(s.index);s.on=true;if(puzzle.input.length===3){puzzle.solved=true;return{accepted:true,solved:true,message:'GRID ONLINE'};}return{accepted:true,message:`RELAY ${s.index+1} ONLINE`};}
  puzzle.input=[];puzzle.failures++;switches.forEach(v=>v.on=false);return{accepted:true,wrong:true,message:'CIRCUIT RESET · CHECK ROUTE DIAGRAM'};
 }
 function playerInsideGate(g,p){return p&&(p.x-g.x)*g.inward>0;}
 function tick(dt,player){
  for(const l of lifts){l.previousY=l.y;if(l.wait>0)l.wait-=dt;else{l.y+=l.direction*l.speed*dt;if(l.y>=l.high){l.y=l.high;l.direction=-1;l.wait=3;}if(l.y<=l.low){l.y=l.low;l.direction=1;l.wait=3;}}}
  for(const g of gates){if(g.remaining>0){g.remaining=Math.max(0,g.remaining-dt);if(g.remaining===0){if((Array.isArray(player)?player:[player]).some(p=>p&&Math.hypot(p.x-g.x,p.z-g.z)<4))g.remaining=.2;else g.open=false;}}g.amount+=Math.sign((g.open?1:0)-g.amount)*Math.min(Math.abs((g.open?1:0)-g.amount),dt*1.8);}
 }
 const values=[...cells.values()],bounds={x1:Math.min(...values.map(c=>c.x))*2,z1:Math.min(...values.map(c=>c.z))*2,x2:(Math.max(...values.map(c=>c.x))+1)*2,z2:(Math.max(...values.map(c=>c.z))+1)*2};
 const start=point(byId.arrival.cx,byId.arrival.cz+2,byId.arrival.y),control=point(byId.cross.cx,byId.cross.cz-3,byId.cross.y),exit=point(byId.boss.cx,byId.boss.z1+2,byId.boss.y),purge=point(byId.west.cx+3,byId.west.cz+3,byId.west.y);
 if(config.profile){
  // Room cutouts also apply to objectives. Keep terminals, keys and cases on the connected deck.
  for(const[p,room]of [[control,'cross'],[clue,'cross'],[accessCard,'west'],[purge,'west'],[exit,'boss'],...switches.map(s=>[s,s.timedGate?'east':'cross']),...cases.map(p=>[p,p.room])]){
   const reachable=(x,z,y)=>canMove(x,z,.7,y)&&floor(x,z,y)!==null&&Math.abs(floor(x,z,y)-y)<.2&&waypoint(start.x,start.z,x,z,{ignoreGates:true});
   if(reachable(p.x,p.z,p.y))continue;
   const options=[...cells.values()].filter(c=>c.room===room&&!c.gap&&Math.abs(c.y-p.y)<.15).sort((a,b)=>(a.x*2+1-p.x)**2+(a.z*2+1-p.z)**2-((b.x*2+1-p.x)**2+(b.z*2+1-p.z)**2));
   const c=options.find(c=>reachable(c.x*2+1,c.z*2+1,c.y));if(c)Object.assign(p,point(c.x,c.z,c.y));
  }
 }
 return extendWorld({seed,theme,layoutVersion:chapter===null?2:3,chapter,profile:config.profile,name:config.name,landmark:config.landmark,obstacles,cells,rooms,stairs,lifts,gates,secrets,switches,puzzle,clue,accessCard,props,signs,encounters,supplies,bounds,at,solid,floor,cellHeight,canMove,blocked,los,walkEdge,waypoint,random,start,control,exit,purge,gap,nests,fabricator,cases,tick,useSwitch,
  region(x,z){const c=at(x,z);return rooms.find(r=>r.id===c?.room)?.name||c?.room?.toUpperCase()||'';},
  bridge(){for(const c of cells.values())if(c.gap)c.gap=false;},
  useGate(id,player){const g=gates.find(g=>g.id===id);if(!g)return{accepted:false};if(id==='security'&&(!accessCard.taken||!puzzle.solved))return{accepted:false,message:!accessCard.taken?'BLUE ACCESS CARD REQUIRED':'RESTORE THE RELAY CIRCUIT'};if(g.timed&&!g.open&&!playerInsideGate(g,player))return{accepted:false,message:'SHUTTER CONTROL IS IN THE DEPOT'};g.open=true;return{accepted:true,message:g.secret?'HIDDEN PASSAGE OPEN':'BULKHEAD OPEN'};},
  discover(x,z){const c=at(x,z),s=secrets.find(s=>s.room===c?.room&&!s.found);if(s){s.found=true;return s;}return null;}
 });
}
