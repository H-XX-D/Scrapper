import {ACTORS} from './catalog.js';
import {distance} from './combat-budget.js';

export const INTEREST_RADIUS=36;
const fields=(o,names)=>Object.fromEntries(names.filter(k=>o[k]!==undefined).map(k=>[k,o[k]]));
const actorFields='id type x y z groundY hp state age duration hitFlash slow attachedTo dormant'.split(' ');
export function actorState(a){return fields(a,actorFields);}
export function guardianState(actors){return actors.filter(a=>a.hp>0&&ACTORS[a.type].tier==='BOSS').map(a=>({id:a.id,type:a.type,x:a.x,y:a.groundY||0,z:a.z,hp:a.hp}));}
const location=o=>({x:o.x,y:o.groundY??o.y??0,z:o.z});
function nearEvent(e,p){
 const d=e.data||{},points=[d.position,d.point,d.from,d.to,d].filter(q=>Number.isFinite(q?.x)&&Number.isFinite(q?.z));
 if(!points.length)return true;
 if(points.some(q=>distance(q,p)<=INTEREST_RADIUS))return true;
 // A long beam can pass the viewer even when both endpoints are distant.
 if(d.from&&d.to){const a=d.from,b=d.to,dx=b.x-a.x,dy=(b.y||0)-(a.y||0),dz=b.z-a.z,l=dx*dx+dy*dy+dz*dz||1,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-(a.y||0))*dy+(p.z-a.z)*dz)/l));return distance({x:a.x+dx*t,y:(a.y||0)+dy*t,z:a.z+dz*t},p)<=INTEREST_RADIUS;}
 return false;
}
export function peerState(state,id){
 const self=state.crew.find(m=>m.id===id);if(!self)return null;
 const p=self.player,near=o=>distance(location(o),p)<=INTEREST_RADIUS;
 return{
  ...state,
  crew:state.crew.map(m=>m.id===id?m:{...m,player:fields(m.player,'x y z yaw pitch hp down dead grab grabVisual grabRecovery grabRelease'.split(' ')),arsenal:{selected:m.arsenal.selected},visor:undefined}),
  actors:state.actors.filter(a=>(a.hp<=0||!a.dormant)&&near(a)),
  projectiles:state.projectiles.filter(near),waves:state.waves.filter(near),
  infestation:{clock:state.infestation.clock,patches:state.infestation.patches.filter(near)},
  clingerPods:state.clingerPods.filter(near),
  events:state.events.filter(e=>nearEvent(e,p))
 };
}
