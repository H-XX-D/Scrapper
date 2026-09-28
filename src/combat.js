import{ACTORS,WEAPONS,WEAPON_BY_ID}from'./catalog.js';
export class Arsenal{
 constructor(){this.slots=Object.fromEntries(WEAPONS.map((w,i)=>[w.id,{owned:i===0,mag:i===0?w.mag:0,reserve:i===0?w.reserve:0}]));this.selected='bolt';this.reload=null;this.cooldown=0;}
 equip(id){if(!this.slots[id]?.owned)return false;if(this.selected!==id)this.reload=null;this.selected=id;return true;}
 unlock(id){const s=this.slots[id],w=WEAPON_BY_ID[id];if(!s||!w)return false;const fresh=!s.owned;s.owned=true;if(fresh)s.mag=w.mag;s.reserve+=Math.ceil(w.reserve/2);this.equip(id);return true;}
 addAmmo(id,n){const s=this.slots[id];if(!s)return false;s.reserve=Math.min(999,s.reserve+n);return true;}
 startReload(){const s=this.slots[this.selected],w=WEAPON_BY_ID[this.selected];if(this.reload||s.mag===w.mag||s.reserve<=0)return false;this.reload={id:w.id,age:0,duration:w.reload};return true;}
 update(dt){this.cooldown=Math.max(0,this.cooldown-dt);if(!this.reload)return;this.reload.age+=dt;if(this.reload.age>=this.reload.duration){const s=this.slots[this.reload.id],w=WEAPON_BY_ID[this.reload.id],n=Math.min(w.mag-s.mag,s.reserve);s.mag+=n;s.reserve-=n;this.reload=null;}}
 fire(){const s=this.slots[this.selected];if(this.reload||this.cooldown>0||!s.owned)return null;if(s.mag<=0){this.startReload();return null;}s.mag--;const w=WEAPON_BY_ID[this.selected];this.cooldown=w.delay;return w;}
}
export function aimDirection(origin,target){const dx=target.x-origin.x,dy=target.y-origin.y,dz=target.z-origin.z,len=Math.hypot(dx,dy,dz)||1;return{x:dx/len,y:dy/len,z:dz/len};}
export function raySphere(origin,dir,center,r){const x=origin.x-center.x,y=origin.y-center.y,z=origin.z-center.z,b=x*dir.x+y*dir.y+z*dir.z,c=x*x+y*y+z*z-r*r,d=b*b-c;if(d<0)return null;const t=-b-Math.sqrt(d);return t>=0?t:(-b+Math.sqrt(d)>=0?0:null);}
let serial=0;
export function makeActor(id,x,z){const d=ACTORS[id];return{id:++serial,type:id,x,z,y:0,hp:d.hp,maxHp:d.hp,state:'idle',age:0,duration:0,cooldown:1+(serial%5)*.22,cycle:0,slow:0,target:null,pathAge:0,hitFlash:0,phase:1};}
export function makeNest(x,z,machine=false){return{id:++serial,x,z,machine,hp:machine?180:145,state:'idle',age:0,timer:5,burstDone:false,spawned:0};}
export function damageNest(n,damage,emit){if(n.state==='husk'||n.state==='rupture')return false;n.hp-=damage;if(n.hp>0){n.state='hurt';n.age=0;return false;}n.hp=0;n.state='rupture';n.age=0;if(!n.burstDone){n.burstDone=true;emit({type:'nestBurst',nest:n,count:n.machine?2:4});}return true;}
export function updateNest(n,dt,active,emit){n.age+=dt;if(n.state==='rupture'){if(n.age>.9){n.state='husk';n.age=0;}return;}if(n.state==='husk')return;if(n.state==='hurt'&&n.age>.3){n.state='idle';n.age=0;}if(n.state==='spawn'&&n.age>1){n.state='idle';n.age=0;}if(active){n.timer-=dt;if(n.timer<=0){n.timer=8;n.state='spawn';n.age=0;n.spawned++;emit({type:'spawn',nest:n,count:n.machine?1:2});}}}
const setState=(a,state,duration=0)=>{a.state=state;a.age=0;a.duration=duration;};
export function hurtActor(a,amount,mode='bullet',emit=()=>{}){if(a.hp<=0)return false;const d=ACTORS[a.type];if(d.tier!=='ENEMY')a.hunting=true;if(d.armor&&!['recover','hurt'].includes(a.state)&&mode==='bullet')amount*=.42;a.hp=Math.max(0,a.hp-amount);a.hitFlash=.1;if(mode==='freeze')a.slow=2.5;if(a.hp===0){setState(a,'death',1);emit({type:'killed',actor:a});return true;}
 const interrupt=d.interruptible||((mode==='chain'||mode==='pierce')&&['tell','altTell'].includes(a.state));if(interrupt&&a.state!=='attack'&&a.state!=='altAttack'){setState(a,'hurt',.45);a.cooldown=.8;}return false;}
export function updateActor(a,dt,player,world,emit){
 const d=ACTORS[a.type];a.groundY=world.floor(a.x,a.z,a.groundY??Infinity)??a.groundY??0;a.age+=dt;a.cooldown-=dt;a.slow=Math.max(0,a.slow-dt);a.hitFlash=Math.max(0,a.hitFlash-dt);
 if(a.hp<=0)return;
 const dx=player.x-a.x,dz=player.z-a.z,dist=Math.hypot(dx,dz,(a.groundY||0)-(player.y||0)),sight=dist<38&&world.los(a.x,a.z,player.x,player.z,(a.groundY||0)+1,(player.y||0)+1);
 if(d.tier!=='ENEMY'&&sight)a.hunting=true;
 a.phase=d.tier==='BOSS'?(a.hp<a.maxHp*.33?3:a.hp<a.maxHp*.66?2:1):1;
 if(a.state==='hurt'||a.state==='recover'){if(a.age>a.duration)setState(a,'move');return;}
 if(a.state==='tell'||a.state==='altTell'){
  if(a.age>=a.duration){const alternate=a.state==='altTell',kind=alternate?d.alternate:d.primary;setState(a,alternate?'altAttack':'attack',kind==='charge'?.8:kind==='leap'?.5:.65);a.attackKind=kind;emit({type:'attack',actor:a,kind,target:a.target});}
  return;
 }
 if(a.state==='attack'||a.state==='altAttack'){
  if(['charge','leap'].includes(a.attackKind)&&a.target){const v=a.attackKind==='charge'?14:12,dir=aimDirection({x:a.x,y:0,z:a.z},{...a.target,y:0}),nx=a.x+dir.x*v*dt,nz=a.z+dir.z*v*dt;if(world.canMove(nx,nz,.4,(a.groundY||0)+a.y)){a.x=nx;a.z=nz;a.y=a.attackKind==='leap'?Math.sin(a.age/a.duration*Math.PI)*1.1:0;}else{setState(a,'hurt',2);a.y=0;emit({type:'impact',actor:a});}if(dist<1.5&&!a.contact){emit({type:'damage',amount:d.damage});a.contact=true;}}
  if(a.age>=a.duration){setState(a,'recover',d.recovery/(a.phase===3?1.2:1));a.y=0;a.cooldown=d.recovery+.25;}return;
 }
 if(dist<d.range&&sight&&a.cooldown<=0){a.cycle++;a.target={x:player.x,y:player.y+1,z:player.z};a.contact=false;const alt=a.cycle%2===0;setState(a,alt?'altTell':'tell',d.windup*(a.phase===3?.85:1));emit({type:'tell',actor:a,kind:alt?d.alternate:d.primary});return;}
 if(dist>2&&(dist<34||a.hunting)){setStateUnless(a,'move');a.pathAge-=dt;let target=player;if(!sight){if(a.pathAge<0){a.waypoint=world.huntWaypoint?world.huntWaypoint(a.x,a.z,player,a.groundY):world.waypoint(a.x,a.z,player.x,player.z,{startY:a.groundY,endY:player.y});a.pathAge=.65+(a.id%7)*.035;}target=a.waypoint||a;}const tx=target.x-a.x,tz=target.z-a.z,l=Math.hypot(tx,tz)||1;
  let vx=tx/l*d.speed,vz=tz/l*d.speed;if(d.family==='MACHINE'&&sight&&dist<10){vx=-tz/l*d.speed*Math.sin(a.id);vz=tx/l*d.speed*Math.sin(a.id);}
  if(d.ranged&&sight&&dist<d.range*.38){vx=-tx/l*d.speed;vz=-tz/l*d.speed;}if(d.flanker&&sight){const weave=Math.sin(a.age*6+a.id)*d.speed*.65;vx+=-tz/l*weave;vz+=tx/l*weave;}
  const slow=a.slow>0?.4:1,nx=a.x+vx*dt*slow,nz=a.z+vz*dt*slow;if(world.canMove(nx,a.z,.5,a.groundY||0)&&world.floor(nx,a.z,a.groundY)!==null)a.x=nx;if(world.canMove(a.x,nz,.5,a.groundY||0)&&world.floor(a.x,nz,a.groundY)!==null)a.z=nz;
 }else setStateUnless(a,'idle');
}
function setStateUnless(a,state){if(a.state!==state)setState(a,state);}
