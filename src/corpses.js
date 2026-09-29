// Shared art stays cached; only the retired actor and its material are discarded.
export const CORPSE_LIMIT=30,ROOM_CORPSE_LIMIT=5,EMPTY_ROOM_LIMIT=2,EMPTY_ROOM_DELAY=12;
export function corpseRoom(world,p){const c=world.at(p.x,p.z,p.groundY??p.y??0);return c?.room==='passage'?'passage:'+String(c.link||'station'):c?.room||'outside';}
export function groundCorpse(a,world){
 a.y=0;a.attachedTo=null;
 const floor=world.floor(a.x,a.z,a.groundY??Infinity);
 if(floor!==null&&Number.isFinite(floor))a.groundY=floor;
 return floor;
}
export class CorpseCleanup{
 constructor(){this.emptySince=new Map();this.clock=0;}
 prune(actors,world,members,dt,remove=()=>{}){
  this.clock+=dt;const occupied=new Set(members.filter(m=>(m.player||m).hp>0).map(m=>corpseRoom(world,m.player||m))),rooms=new Map(),discard=new Set();
  for(const a of actors){if(a.hp>0)continue;const floor=groundCorpse(a,world);if(floor===null){discard.add(a);continue;}const key=corpseRoom(world,a);if(!rooms.has(key))rooms.set(key,[]);rooms.get(key).push(a);}
  const retained=[];
  for(const [key,bodies]of rooms){
   if(occupied.has(key))this.emptySince.delete(key);else if(!this.emptySince.has(key))this.emptySince.set(key,this.clock);
   const limit=!occupied.has(key)&&this.clock-this.emptySince.get(key)>=EMPTY_ROOM_DELAY?EMPTY_ROOM_LIMIT:ROOM_CORPSE_LIMIT;
   // Smallest death age is newest. Stable ID breaks simultaneous-kill ties.
   bodies.sort((a,b)=>a.age-b.age||b.id-a.id);
   bodies.forEach((a,i)=>i<limit?retained.push({a,occupied:occupied.has(key)}):discard.add(a));
  }
  for(const key of this.emptySince.keys())if(!rooms.has(key))this.emptySince.delete(key);
  retained.sort((a,b)=>Number(b.occupied)-Number(a.occupied)||a.a.age-b.a.age||b.a.id-a.a.id);
  for(const {a}of retained.slice(CORPSE_LIMIT))discard.add(a);
  if(!discard.size)return actors;
  for(const a of discard)remove(a);
  return actors.filter(a=>!discard.has(a));
 }
}

const footAnchors=new WeakMap();
export function corpseAnchor(canvas){
 if(footAnchors.has(canvas))return footAnchors.get(canvas);
 const {width,height}=canvas,data=canvas.getContext('2d').getImageData(0,0,width,height).data;
 let bottom=-1;
 for(let y=height-1;y>=0&&bottom<0;y--)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>56){bottom=y;break;}
 const anchor=bottom<0?0:(height-1-bottom)/height;footAnchors.set(canvas,anchor);return anchor;
}
