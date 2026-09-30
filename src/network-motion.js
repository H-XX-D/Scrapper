import {movePlayer} from './traversal.js';

// Keep input responsive between authoritative snapshots. The host echoes which
// input it has used, and how long it held it; only later local motion is replayed.
export class MovementHistory{
 constructor(){this.reset();}
 reset(){this.clock=0;this.steps=[];this.sent=new Map();}
 record(dt,input,yaw){const start=this.clock;this.clock+=dt;this.steps.push({start,end:this.clock,input:{forward:input.forward,strafe:input.strafe,sprint:input.sprint,jump:input.jump,yaw}});while(this.steps.length&&this.steps[0].end<this.clock-1.5)this.steps.shift();}
 mark(seq){this.sent.set(seq,this.clock);while(this.sent.size>64)this.sent.delete(this.sent.keys().next().value);}
 reconcile(player,seq,age,world){
  const position={...player,safe:player.safe?{...player.safe}:undefined};
  if(player.grab||player.down||player.dead)return position;
  const stamp=this.sent.get(seq);if(stamp===undefined)return position;
  const since=Math.max(this.clock-.25,stamp+Math.max(0,Math.min(.4,age||0)));
  // Moving platforms already have an authoritative height in the world frame.
  // Re-applying their last frame displacement during replay would multiply it.
  const replayWorld={...world,lifts:world.lifts.map(l=>({...l,previousY:l.y}))};
  for(const step of this.steps){if(step.end<=since)continue;position.yaw=step.input.yaw;movePlayer(position,replayWorld,Math.min(.035,step.end-Math.max(step.start,since)),step.input);}
  return position;
 }
}
export function smoothPose(previous,current,dt,{snap=false,rate=22}={}){
 if(!previous||snap||Math.hypot(previous.x-current.x,previous.y-current.y,previous.z-current.z)>6)return{x:current.x,y:current.y,z:current.z};
 const a=1-Math.exp(-Math.max(0,dt)*rate);
 return{x:previous.x+(current.x-previous.x)*a,y:previous.y+(current.y-previous.y)*a,z:previous.z+(current.z-previous.z)*a};
}
