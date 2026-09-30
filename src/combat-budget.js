import {ACTORS} from './catalog.js';

export const MONSTER_LIMIT=30;
// Wider than the 20m fog plane: admission happens before an enemy becomes visible.
export const COMBAT_RADIUS=32;
export const RESIDENT_LIMIT=180;
const point=a=>({x:a.x,y:a.groundY??a.y??0,z:a.z});
export const distance=(a,b)=>Math.hypot(a.x-b.x,(a.y??0)-(b.y??0),a.z-b.z);
const players=members=>members.map(m=>m.player||m).filter(p=>p.hp>0||p.down);

export class CombatBudget{
 update(actors,members){
  const observers=players(members),counts=observers.map(()=>0);
  const candidates=actors.filter(a=>a.hp>0).map(a=>{
   const distances=observers.map(p=>distance(point(a),p));
   const nearest=Math.min(Infinity,...distances),elite=ACTORS[a.type]?.tier!=='ENEMY';
   return{a,distances,nearest,priority:a.attachedTo?-10000:(elite?-1000:0)+(!a.dormant?-100:0)+nearest};
  }).sort((a,b)=>a.priority-b.priority||a.a.id-b.a.id);
  let active=0;
  for(const c of candidates){
   const near=c.distances.map((d,i)=>d<=COMBAT_RADIUS?i:-1).filter(i=>i>=0);
   const hunting=c.a.hunting&&ACTORS[c.a.type]?.tier!=='ENEMY';
   const admitted=(near.length>0||hunting)&&near.every(i=>counts[i]<MONSTER_LIMIT);
   if(!admitted&&!c.a.dormant){c.a.state='idle';c.a.age=0;c.a.duration=0;c.a.target=null;c.a.cooldown=Math.max(1,c.a.cooldown||0);}
   c.a.dormant=!admitted;if(admitted){active++;for(const i of near)counts[i]++;}
  }
  this.stats={limit:MONSTER_LIMIT,active,resident:candidates.length,perPlayer:counts,reserves:candidates.length-active};
  return this.stats;
 }
 canSpawn(position,actors,members){
  const alive=actors.filter(a=>a.hp>0);if(alive.length>=RESIDENT_LIMIT)return false;
  return players(members).every(p=>distance(position,p)>COMBAT_RADIUS||alive.filter(a=>!a.dormant&&distance(point(a),p)<=COMBAT_RADIUS).length<MONSTER_LIMIT);
 }
}
