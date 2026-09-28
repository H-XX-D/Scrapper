// Seeded decorative equipment stays independent of combat RNG and saved mission state.
const type=(sheet,row,w,h,extra={})=>({sheet,row,w,h,frames:4,depth:.48,...extra});
export const STATION_PROPS={
 pump:type('machinery',0,2.5,2.4,{period:2.4,sound:'machine'}),
 panel:type('machinery',1,1.9,1.8,{mount:1,depth:.12,period:2}),
 lifeSupport:type('machinery',2,2.2,2.9,{period:3.2,sound:'air'}),
 compactor:type('machinery',3,2.7,2.4,{period:6.4,sound:'compactor',exhaust:3}),
 steamVent:type('utilities',0,1.8,1.8,{mount:.65,depth:.18,period:7.2,sound:'steam',exhaust:0}),
 manifold:type('utilities',1,2.1,2.7,{period:3.4}),
 junction:type('utilities',2,1.7,2.3,{mount:.3,depth:.18,period:5.3,exhaust:2}),
 airFilter:type('utilities',3,2.4,2.7,{period:1.6,sound:'air'}),
 fan:type('stationMotion',0,1.6,1.6,{mount:1.25,depth:.1,frames:8,period:1.1}),
 radar:type('stationMotion',2,1.5,1.5,{mount:1.2,depth:.1,frames:8,period:2.4}),
 generator:type('legacyProps',4,2.2,2.3,{period:2.8,sound:'machine'}),
 coolant:type('legacyProps',5,1.9,2.6,{period:2.8}),
};
const clutterNames=['cableReel','refuseBin','oxygenBottles','toolbox','mopBucket','serviceCart','scrapCart','ladder','filterStack','supplyCrates','hoseReel','chair','metalDebris','discardedGear','pipeParts','litter'];
const sizes=[[1.25,1.45],[1.2,1.65],[1.05,1.7],[1.25,1.3],[1,1.75],[1.15,1.85],[1.5,1.5],[1.15,2.15],[1.15,1.3],[1.3,1.5],[1.3,1.5],[1.1,1.6],[1.25,.48],[1.05,.52],[1.2,.66],[1.2,.4]];
clutterNames.forEach((name,i)=>STATION_PROPS[name]=type('clutter',Math.floor(i/4),...sizes[i],{frames:1,col:i%4,depth:i>=12?0:.32,clutter:true,billboard:true}));
const hash=(seed,x,z,side=0)=>{let h=(seed^Math.imul(x,374761393)^Math.imul(z,668265263)^Math.imul(side,1274126177))>>>0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
const equipment=Object.keys(STATION_PROPS).filter(k=>!STATION_PROPS[k].clutter);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function stationPropPlan(world,reserved=[]){
 const keepClear=[world.start,world.control,world.purge,world.exit,world.clue,world.accessCard,world.fabricator,...world.switches,...world.cases,...world.nests,...world.supplies,...reserved].filter(Boolean);
 const anchors=[],props=[];
 const clear=p=>!keepClear.some(n=>Math.abs((n.floor??n.y??0)-p.y)<2&&distance(n,p)<2.8)&&!world.gates.some(n=>distance(n,p)<n.width+2)&&!world.lifts.some(n=>distance(n,p)<5.5);
 for(const c of world.renderCells()){
  if(c.gap||c.stair||c.liftId||c.gate||c.ceiling-c.y<3.3)continue;
  const x=c.x*2+1,z=c.z*2+1;
  for(const[side,[dx,dz]]of [[1,0],[-1,0],[0,1],[0,-1]].entries()){
   if(world.at(x+dx*2,z+dz*2,c.y))continue;
   if([-1,1].some(s=>{const n=world.at(x-dz*s*2,z+dx*s*2,c.y);return!n||n.gap||n.stair||n.gate||n.liftId||Math.abs(n.y-c.y)>.1||world.at(x+dx*2-dz*s*2,z+dz*2+dx*s*2,c.y);}))continue;
   const p={x:x+dx*.96,z:z+dz*.96,y:c.y,nx:-dx||0,nz:-dz||0,room:c.room,ceiling:c.ceiling,roll:hash(world.seed,c.x,c.z,side)};
   if(clear(p)&&!world.obstacles.some(o=>Math.abs(o.y-p.y)<2&&distance(o,p)<Math.max(o.w,o.d)/2+1.8))anchors.push(p);
  }
 }
 const groups=new Map();for(const a of anchors){if(!groups.has(a.room))groups.set(a.room,[]);groups.get(a.room).push(a);}
 const favored=world.theme===1?['lifeSupport','airFilter','panel','manifold']:world.theme===2?['pump','coolant','steamVent','manifold']:world.theme===3?['compactor','generator','junction','steamVent']:['compactor','pump','panel','steamVent'];
 let serial=0;
 const add=(a,kind,extra={})=>{const d=STATION_PROPS[kind],p={...a,...extra,kind,id:'station-'+serial++,phase:a.roll*17,w:d.w,h:d.h,mount:d.mount||0};delete p.roll;props.push(p);return p;};
 for(const[room,list]of groups){
  list.sort((a,b)=>a.roll-b.roll);const target=room==='passage'?48:room.includes('service')||room.includes('conduit')?20:18;let placed=0;
  for(const a of list){if(placed>=target)break;if(props.some(p=>Math.abs(p.y-a.y)<2.8&&distance(p,a)<3.35))continue;
   const kind=placed%3===0?favored[(placed+Math.floor(a.roll*47))%favored.length]:equipment[(placed+Math.floor(a.roll*233))%equipment.length];add(a,kind);placed++;
  }
 }
 // Small maintenance debris fills gaps between equipment and along service walls.
 for(const a of anchors.sort((a,b)=>hash(world.seed+19,a.x,a.z)-hash(world.seed+19,b.x,b.z))){
  if(props.filter(p=>STATION_PROPS[p.kind].clutter).length>=150)break;
  if(props.some(p=>Math.abs(p.y-a.y)<2.8&&distance(p,a)<1.6))continue;
  const kind=clutterNames[Math.floor(a.roll*1231)%16];add(a,kind,{x:a.x+a.nx*.3,z:a.z+a.nz*.3});
 }
 return props;
}
export function installStationProps(world,reserved=[]){
 if(world.stationProps)return world.stationProps;
 world.stationProps=stationPropPlan(world,reserved);
 for(const p of world.stationProps){const d=STATION_PROPS[p.kind];if(!d.depth||d.mount)continue;const depth=d.depth,along=p.w*.68;world.obstacles.push({x:p.x+p.nx*depth/2,z:p.z+p.nz*depth/2,y:p.y,w:p.nx?depth:along,d:p.nz?depth:along,h:p.h*.85,stationProp:p.id});}
 world.invalidateRoutes?.();return world.stationProps;
}
export function propPhase(p,time){
 const d=STATION_PROPS[p.kind],cycle=d.period||1,t=((time+p.phase)%cycle+cycle)%cycle,u=t/cycle;
 const frame=d.frames===1?d.col:Math.min(d.frames-1,Math.floor(u*d.frames));
 const puff=d.exhaust===undefined?-1:(u-.36)/.34;
 return{frame,cycle:Math.floor((time+p.phase)/cycle),puff:puff>=0&&puff<=1?puff:-1};
}
// A recovery saved before this equipment existed may be inside its new footprint.
export function clearStationOverlap(world,player){
 const obstacle=world.obstacles.find(o=>o.stationProp&&player.x>o.x-o.w/2-.3&&player.x<o.x+o.w/2+.3&&player.z>o.z-o.d/2-.3&&player.z<o.z+o.d/2+.3&&player.y<o.y+o.h&&player.y+1.7>o.y);
 if(!obstacle)return false;const prop=world.stationProps.find(p=>p.id===obstacle.stationProp);
 for(let distance=.1;distance<=2;distance+=.1){const x=player.x+prop.nx*distance,z=player.z+prop.nz*distance,floor=world.floor(x,z,player.y);if(floor!==null&&Math.abs(floor-player.y)<.5&&world.canMove(x,z,.3,player.y)){Object.assign(player,{x,z,safe:{x,y:player.y,z}});return true;}}return false;
}
