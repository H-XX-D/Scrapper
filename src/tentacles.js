// Host-authoritative grab state lives in the existing player/colony snapshots.
export const GRAB_DURATION=4.5,ESCAPE_STEPS=7;
export function struggleDirection(input={}){const x=input.strafe||0,y=input.forward||0;if(Math.max(Math.abs(x),Math.abs(y))<.45)return'';if(Math.abs(x)>.45&&Math.abs(y)>.45)return(y>0?'forward':'back')+'-'+(x>0?'right':'left');return Math.abs(x)>Math.abs(y)?x>0?'right':'left':y>0?'forward':'back';}
export function releaseGrab(player,patch,reason='escaped'){if(!player.grab)return;player.grab=null;player.grabRecovery=.45;player.grabImmune=3;if(patch){patch.tentacleState='recoil';patch.tentacleAge=0;patch.grabTarget=null;patch.grabCooldown=8;}player.grabRelease=reason;}
export function tickTentacles(system,members,dt,inputFor=()=>({}),damage=()=>{}){
 const byId=new Map(members.map(m=>[m.id,m]));
 for(const m of members){const p=m.player;p.grabImmune=Math.max(0,(p.grabImmune||0)-dt);p.grabRecovery=Math.max(0,(p.grabRecovery||0)-dt);if(!p.grab)continue;const patch=system.patches.find(t=>t.id===p.grab.patch);if(!patch||patch.dead||p.hp<=0){releaseGrab(p,patch,'destroyed');continue;}const g=p.grab;g.age+=dt;const dir=struggleDirection(inputFor(m.id));if(dir&&dir!==g.lastDirection&&g.age-g.lastInput>=.1){g.steps++;g.lastDirection=dir;g.lastInput=g.age;}if(g.steps>=ESCAPE_STEPS||g.age>=GRAB_DURATION){releaseGrab(p,patch,g.steps>=ESCAPE_STEPS?'escaped':'released');continue;}if(g.age>=g.nextDamage){g.nextDamage+=1;damage(m,3);}p.vy=0;
 }
 for(const p of system.patches){p.tentacleAge=(p.tentacleAge||0)+dt;p.grabCooldown=Math.max(0,(p.grabCooldown||0)-dt);if(p.dead){if(p.grabTarget){const target=byId.get(p.grabTarget);if(target)releaseGrab(target.player,p,'destroyed');}continue;}
  if(p.tentacleState==='grip'){if(!byId.get(p.grabTarget)?.player.grab){p.tentacleState='recoil';p.tentacleAge=0;p.grabTarget=null;p.grabCooldown=8;}continue;}
  if(p.tentacleState==='recoil'){if(p.tentacleAge>.65){p.tentacleState='idle';p.tentacleAge=0;}continue;}
  const candidates=members.filter(m=>m.player.hp>0&&!m.player.grab&&!(m.player.grabImmune>0)&&Math.hypot(m.player.x-p.x,m.player.z-p.z,m.player.y+.9-p.y)<p.reach);
  if(p.tentacleState==='windup'){
   if(p.tentacleAge<.85)continue;const m=candidates.find(m=>m.id===p.grabTarget);if(m&&system.world.los(p.x,p.z,m.player.x,m.player.z,p.y,m.player.y+.9)){m.player.grab={patch:p.id,age:0,steps:0,lastDirection:'',lastInput:-1,nextDamage:1};p.tentacleState='grip';p.tentacleAge=0;}
   else{p.tentacleState='recoil';p.tentacleAge=0;p.grabCooldown=4;p.grabTarget=null;}continue;
  }
  if(p.maturity<.55||p.grabCooldown>0)continue;
  const m=candidates.find(m=>system.world.los(p.x,p.z,m.player.x,m.player.z,p.y,m.player.y+.9));if(m){p.tentacleState='windup';p.tentacleAge=0;p.grabTarget=m.id;p.strikeTarget={x:m.player.x,y:m.player.y+.9,z:m.player.z};}
 }
}
export function tentacleFrame(p){if(p.dead)return(p.deathAge||0)<.18?5:(p.deathAge||0)<.75?6:7;return p.tentacleState==='grip'?4:p.tentacleState==='recoil'?5:p.tentacleState==='windup'?Math.min(3,1+Math.floor(p.tentacleAge*3)):Math.floor(p.age*1.5)%2;}
export function grabbedFrame(p){if(!p.grab)return 7;return p.grab.steps>=6?6:['left','forward','right','back'].some(d=>p.grab.lastDirection.includes(d))?1+['left','forward','right','back'].findIndex(d=>p.grab.lastDirection.includes(d)):Math.min(5,Math.floor(p.grab.age*7)%6);}
