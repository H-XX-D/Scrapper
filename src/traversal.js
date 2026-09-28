// The game and traversal checks share the same movement, stair, and platform rules.
export function playerFloor(world,x,z,y){
 const floors=[[0,0],[.29,.29],[.29,-.29],[-.29,.29],[-.29,-.29]].map(([dx,dz])=>world.floor(x+dx,z+dz,y)).filter(f=>f!==null&&f!==undefined&&f<=y+.51);
 return floors.length?Math.max(...floors):null;
}
export function movePlayer(player,world,dt,{forward=0,strafe=0,sprint=false,jump=false}={}){
 const support=world.at(player.x,player.z,player.y),lift=support?.liftId&&world.lifts.find(l=>l.id===support.liftId);
 if(lift&&player.grounded&&Math.abs(player.y-lift.previousY)<.15)player.y+=lift.y-lift.previousY;
 const magnitude=Math.hypot(forward,strafe),length=Math.max(1,magnitude),rate=sprint?11.5:7.4,speed=rate*Math.min(1,magnitude),f=forward/length,r=strafe/length;
 const dx=(-Math.sin(player.yaw)*f+Math.cos(player.yaw)*r)*rate*dt,dz=(-Math.cos(player.yaw)*f-Math.sin(player.yaw)*r)*rate*dt;
 // Short substeps make narrow stair treads usable at low frame rates and while sprinting.
 const substeps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));
 for(let i=0;i<substeps;i++){
  if(world.canMove(player.x+dx/substeps,player.z,.3,player.y))player.x+=dx/substeps;
  if(world.canMove(player.x,player.z+dz/substeps,.3,player.y))player.z+=dz/substeps;
  const supportFloor=playerFloor(world,player.x,player.z,player.y);
  if(player.grounded&&supportFloor!==null&&Math.abs(supportFloor-player.y)<.65)player.y=supportFloor;
 }
 const floor=playerFloor(world,player.x,player.z,player.y);
 if(jump&&player.grounded){player.vy=7;player.grounded=false;}
 if(player.grounded&&floor!==null&&Math.abs(floor-player.y)<.65)player.y=floor;
 else if(floor===null||floor<player.y-.65)player.grounded=false;
 if(!player.grounded){player.vy-=18*dt;player.y+=player.vy*dt;const c=world.at(player.x,player.z,player.y);if(c&&player.y+1.8>c.ceiling){player.y=c.ceiling-1.8;player.vy=Math.min(0,player.vy);}if(floor!==null&&player.y<=floor&&player.vy<=0){player.y=floor;player.vy=0;player.grounded=true;}}
 if(player.grounded&&floor!==null&&!support?.liftId)player.safe={x:player.x,z:player.z,y:player.y};
 if(player.y<-20){Object.assign(player,player.safe,{vy:0,grounded:true});return{fell:true,moving:!!(f||r),speed};}
 return{fell:false,moving:!!(f||r),speed};
}
