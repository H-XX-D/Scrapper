import {rng} from './world.js';
export const POD_TRIGGER_RANGE=10;
export const POD_BROODS=[1,3,5,2];
export function clingerLaunchPoint(p,index,world){
 if(!p.row)return{x:p.x,z:p.z};
 const angle=index*2.399963+p.id*.4,radius=.28+.09*(index%3),x=p.x+Math.cos(angle)*radius,z=p.z+Math.sin(angle)*radius;
 return world.canMove(x,z,.3,p.y)?{x,z}:{x:p.x,z:p.z};
}
export function clingerPodPlan(world,reserved=[]){
 const random=rng(world.seed^0x5030dad),out=[],counts=new Map();
 const keep=[world.start,world.exit,world.control,world.purge,world.accessCard,...world.cases,...world.switches,...reserved].filter(Boolean);
 const candidates=[];
 for(const c of world.renderCells()){
  if(c.gap||c.stair||c.liftId||c.gate||c.room==='arrival')continue;
  const x=c.x*2+1,z=c.z*2+1;
  if(!world.canMove(x,z,.42,c.y)||Math.hypot(x-world.start.x,z-world.start.z)<14||keep.some(p=>Math.hypot(x-p.x,z-p.z,c.y-p.y)<3))continue;
  const walls=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dz])=>!world.at(x+dx*2,z+dz*2,c.y));
  const nearProp=world.stationProps?.some(p=>Math.abs(p.y-c.y)<.3&&Math.hypot(p.x-x,p.z-z)<2.8);
  if(!walls.length&&!nearProp)continue;
  const corner=walls.some(a=>walls.some(b=>a[0]*b[0]+a[1]*b[1]===0));
  candidates.push({x,z,y:c.y,room:c.room,corner,score:(corner?0:nearProp?1:2)+random(),roll:random()});
 }
 for(const p of candidates.sort((a,b)=>a.score-b.score)){
  const count=counts.get(p.room)||0;if(count>=(p.room==='passage'?12:4)||out.length>=52||out.some(q=>Math.hypot(q.x-p.x,q.z-p.z,q.y-p.y)<3.6))continue;
  const row=count===1?1+Math.floor(p.roll*3):0;
  out.push({id:out.length,x:p.x,y:p.y,z:p.z,room:p.room,corner:p.corner,row,hp:row?44:22,state:'closed',age:0,remaining:POD_BROODS[row],spawned:0});counts.set(p.room,count+1);
 }return out;
}
export class ClingerPods{
 constructor(world,reserved=[],enabled=true){this.world=world;this.pods=enabled?clingerPodPlan(world,reserved):[];}
 tick(dt,members,launch){
  for(const p of this.pods){p.age+=dt;if(p.hp<=0||p.state==='empty')continue;if(p.state==='opening'&&!p.remaining&&p.age>.35){p.state='empty';p.age=0;continue;}
   const targets=members.filter(m=>m.player.hp>0&&Math.hypot(m.player.x-p.x,m.player.z-p.z,m.player.y-p.y)<=POD_TRIGGER_RANGE&&this.world.los(p.x,p.z,m.player.x,m.player.z,p.y+.5,m.player.y+1)).sort((a,b)=>Math.hypot(a.player.x-p.x,a.player.z-p.z)-Math.hypot(b.player.x-p.x,b.player.z-p.z));
   if(!targets.length)continue;
   if(p.state==='closed'){p.state='opening';p.age=0;}
   // All eggs in the cluster open together. A full actor budget delays the
   // remaining brood instead of silently losing it or exceeding the cap.
   while(p.remaining>0){const target=targets[p.spawned%targets.length];if(!launch(p,target,p.spawned))break;p.remaining--;p.spawned++;}
   if(!p.remaining&&p.age>.35){p.state='empty';p.age=0;}
  }
 }
 hit(p,amount){if(!p||p.hp<=0)return false;p.hp=Math.max(0,p.hp-amount);if(!p.hp){p.state='dead';p.age=0;p.remaining=0;return true;}return false;}
 frame(p){return p.state==='dead'?(p.age<.35?6:7):p.state==='empty'?5:p.state==='opening'?Math.min(4,2+Math.floor(p.age*16)):Math.floor(p.age*2+p.id)%2;}
 snapshot(){return this.pods.map(p=>({...p}));}
 restore(pods){if(!Array.isArray(pods))return;const saved=new Map(pods.map(p=>[p.id,p]));for(const p of this.pods){const s=saved.get(p.id);if(s)Object.assign(p,{hp:s.hp,state:s.state,age:s.age,remaining:s.remaining,spawned:s.spawned});}}
}
