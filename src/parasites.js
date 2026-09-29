import{beginGrab,PARASITES}from'./grabs.js';
export function attachParasite(actor,member,input={}){if(!PARASITES.includes(actor.type)||actor.hp<=0||actor.attachedTo)return false;if(!beginGrab(member.player,actor,actor.type,input))return false;actor.attachedTo=member.id;actor.state='attached';actor.age=0;actor.x=member.player.x;actor.z=member.player.z;actor.groundY=member.player.y;actor.y=actor.type==='facehugger'?1.3:.7;return true;}
export function parasiteAttackStep(a,dt,player,world,emit){
 if(a.attachedTo)return true;
 if(!PARASITES.includes(a.type)||!['attack','altAttack'].includes(a.state))return false;
 const dx=a.target.x-a.x,dz=a.target.z-a.z,dist=Math.hypot(dx,dz),travel=Math.min(dist,dt*(a.podLaunch?30:a.type==='gnats'?8:12)),steps=Math.max(1,Math.ceil(travel/.15));
 for(let i=0;i<steps;i++){const x=a.x+dx/(dist||1)*travel/steps,z=a.z+dz/(dist||1)*travel/steps;if(!world.canMove(x,z,.3,a.groundY||0)||world.floor(x,z,a.groundY)===null)break;a.x=x;a.z=z;
  if(!a.contact&&Math.hypot(a.x-player.x,a.z-player.z,(a.groundY||0)-(player.y||0))<1.1&&world.los(a.x,a.z,player.x,player.z,(a.groundY||0)+1,(player.y||0)+1)){a.contact=true;emit({type:'latch',actor:a});break;}}
 a.y=a.type==='facehugger'?Math.max(0,Math.sin(Math.min(1,a.age/a.duration)*Math.PI))*1.35:a.type==='gnats'?.6:Math.max(0,Math.sin(a.age/a.duration*Math.PI))*.35;
 if(a.attachedTo)return true;
 if(a.age>=a.duration){a.state='recover';a.age=0;a.duration=1.2;a.y=0;a.cooldown=2;a.podLaunch=false;}return true;
}

export function releaseOrphanParasites(actors,members){for(const a of actors)if(a.attachedTo&&!members.some(m=>m.id===a.attachedTo&&m.player.grab?.actor===a.id)){a.attachedTo=null;a.y=0;a.state=a.hp>0?'recover':'death';a.age=0;a.duration=1.5;a.cooldown=3.5;}}
