export const enemyMultiplier=(mode,count)=>mode==='ffa'?0:mode==='coop'?Math.max(1,Math.min(4,count)):1;
export function directionalFrame(yaw,viewer,position,walkAge=0,moving=false){const angle=Math.atan2(-(viewer.x-position.x),-(viewer.z-position.z))-yaw,direction=((Math.round(angle/(Math.PI*2)*16)%16)+16)%16,step=moving?Math.floor(walkAge*9)%4:0;return{direction,step,col:direction%8,row:Math.floor(direction/8)+step*2};}
export function canHurtPlayer(mode,attackerId,targetId){return attackerId!==targetId&&(mode==='ffa'||mode==='pvpve');}
export function hitPlayer(target,amount,{mode='solo',attacker=null}={}){
 const p=target.player;if(p.hp<=0||p.hurtCooldown>0)return false;p.hp=Math.max(0,p.hp-amount);p.hurtCooldown=.22;
 if(p.hp===0){p.down=mode==='coop';p.dead=mode!=='coop';p.downAge=0;p.revive=0;target.lastAttacker=attacker;target.deaths=(target.deaths||0)+1;return true;}return false;
}
export function updateRevives(members,dt,world,inputFor){
 const revived=[];for(const target of members){const p=target.player;if(!p.down)continue;p.downAge+=dt;
  const helper=members.find(m=>m!==target&&m.player.hp>0&&inputFor(m.id).revive&&!inputFor(m.id).fire&&Math.hypot(m.player.x-p.x,m.player.z-p.z,m.player.y-p.y)<3.2&&world.los(m.player.x,m.player.z,p.x,p.z,m.player.y+1,p.y+1));
  p.revive=helper?Math.min(3,p.revive+dt):0;if(p.revive>=3){p.hp=40;p.down=false;p.dead=false;p.downAge=0;p.revive=0;p.hurtCooldown=2;revived.push({target:target.id,helper:helper.id});}
 }return revived;
}
export function respawnPoint(world,members,random=Math.random){const choices=[world.start,...world.rooms.filter(r=>r.id!=='boss').map(r=>r.center)],score=p=>Math.min(999,...members.filter(m=>m.player.hp>0).map(m=>Math.hypot(p.x-m.player.x,p.z-m.player.z)));return choices.map(p=>({p,score:score(p)+random()*4})).sort((a,b)=>b.score-a.score)[0].p;}
