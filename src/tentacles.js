import{releaseOrphanParasites}from'./parasites.js';
import{beginGrab,releaseGrab,advanceStruggle}from'./grabs.js';
import{tentacleSpan,crossesTentacle,dragCaptive}from'./tentacle-path.js';
export{GRAB_DURATION,ESCAPE_STEPS,struggleDirection,releaseGrab,grabbedFrame}from'./grabs.js';
export function tickTentacles(system,members,dt,inputFor=()=>({}),damage=()=>{},actors=[],onEscape=()=>{}){
 releaseOrphanParasites(actors,members);
 const byId=new Map(members.map(m=>[m.id,m]));
 for(const m of members){const p=m.player;p.grabImmune=Math.max(0,(p.grabImmune||0)-dt);p.grabRecovery=Math.max(0,(p.grabRecovery||0)-dt);if(!p.grab)continue;const g=p.grab,parasite=g.kind&&g.kind!=='tentacle',source=parasite?actors.find(a=>a.id===g.actor):system.patches.find(t=>t.id===g.patch);if(!source||source.dead||source.hp<=0||p.hp<=0){releaseGrab(p,source,'destroyed');continue;}
  if(advanceStruggle(g,inputFor(m.id),dt)||g.age>=g.limit){const escaped=g.steps>=g.required;releaseGrab(p,source,escaped?'escaped':'released');if(parasite)onEscape(source,m,escaped);continue;}
  if(g.age>=g.nextDamage){g.nextDamage=g.age+1.2;damage(m,g.damage);}p.vy=0;
  if(parasite){source.x=p.x;source.z=p.z;source.groundY=p.y;source.y=g.kind==='facehugger'?1.3:g.kind==='gnats'?.7:.8;}
  else if(g.age>g.wrap)dragCaptive(system.world,p,source,dt);
 }
 for(const p of system.patches){p.tentacleAge=(p.tentacleAge||0)+dt;p.grabCooldown=Math.max(0,(p.grabCooldown||0)-dt);if(p.dead)continue;
  if(p.tentacleState==='grip'){if(!byId.get(p.grabTarget)?.player.grab){p.tentacleState='recoil';p.tentacleAge=0;p.grabTarget=null;p.grabCooldown=8;}continue;}
  if(p.tentacleState==='recoil'){p.extension=Math.max(0,(p.extension||0)-dt*20);if(p.tentacleAge>1.15){p.tentacleState='idle';p.tentacleAge=0;}continue;}
  if(p.maturity<.55||p.grabCooldown>0)continue;
  if(members.some(m=>Math.hypot(m.player.x-p.x,m.player.z-p.z,m.player.y-p.floor)<35)){p.spanCheck=(p.spanCheck||0)-dt;if(p.spanCheck<=0){p.span=tentacleSpan(system.world,p);p.spanCheck=.5+(p.id%5)*.04;}p.extension=Math.min(p.span?.length||p.reach,(p.extension||0)+dt*10);}
  const candidates=members.filter(m=>m.player.hp>0&&!m.player.grab&&!m.player.grabRecovery&&!(m.player.grabImmune>0));
  if(p.tentacleState==='windup'){
   if(p.tentacleAge<.85)continue;const m=candidates.find(m=>m.id===p.grabTarget);if(m&&crossesTentacle(p,m.player,2)&&system.world.los(p.x,p.z,m.player.x,m.player.z,p.y,m.player.y+.9)&&beginGrab(m.player,p,'tentacle',inputFor(m.id))){p.tentacleState='grip';p.tentacleAge=0;}
   else{p.tentacleState='recoil';p.tentacleAge=0;p.grabCooldown=4;p.grabTarget=null;}continue;
  }
  const m=candidates.find(m=>crossesTentacle(p,m.player)&&system.world.los(p.x,p.z,m.player.x,m.player.z,p.y,m.player.y+.9));if(m){p.tentacleState='windup';p.tentacleAge=0;p.grabTarget=m.id;p.strikeTarget={x:m.player.x,y:m.player.y+.9,z:m.player.z};}
 }
 for(const m of members)m.player.tentaclePrevious={x:m.player.x,y:m.player.y+1,z:m.player.z};
}
export function tentacleFrame(p){if(p.dead)return(p.deathAge||0)<.18?5:(p.deathAge||0)<.75?6:7;return p.tentacleState==='grip'?4:p.tentacleState==='recoil'?5:p.tentacleState==='windup'?Math.min(3,1+Math.floor(p.tentacleAge*3)):Math.floor(p.age*1.5)%2;}
