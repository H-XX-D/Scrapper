import{playerFloor}from'./traversal.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z,(a.y||0)-(b.y||0));
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const location=p=>`${Math.floor(p.x/2)},${Math.floor(p.z/2)},${Math.round((p.y||0)*2)}`;
export class RouteGuide{
 constructor(world){Object.assign(this,{world,route:[],timer:0,goalKey:'',playerKey:'',next:null,portal:null,distance:0,relative:0,elevation:0,action:'',status:'idle',revision:0});}
 clearSegment(a,b){
  if(!this.world.los(a.x,a.z,b.x,b.z,a.y+1.2,b.y+1.2))return false;
  const steps=Math.ceil(distance(a,b)/.15);let feet=a.y;
  for(let i=1;i<=steps;i++){const t=i/steps,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;if(!this.world.canMove(x,z,.3,feet))return false;const floor=playerFloor(this.world,x,z,feet);if(floor===null||floor===undefined||Math.abs(floor-feet)>.65)return false;feet=floor;}return Math.abs(feet-b.y)<.6;
 }
 plan(player,goal){
  const options={fullPath:true,includeLifts:true,startY:player.y,endY:goal.y};
  this.route=this.world.waypoint(player.x,player.z,goal.x,goal.z,options)||[];
  if(!this.route.length){
   // A closed gate or occupied terminal is approached from reachable floor, never through the wall.
   let best=Infinity;for(const[dx,dz]of [[0,2],[0,-2],[2,0],[-2,0],[0,4],[0,-4],[4,0],[-4,0]]){const end={x:goal.x+dx,z:goal.z+dz,y:goal.y};if(!this.world.canMove(end.x,end.z,.35,end.y))continue;const route=this.world.waypoint(player.x,player.z,end.x,end.z,options);if(route&&route.length<best){this.route=route;best=route.length;}}
  }
  this.revision++;
 }
 update(player,goal,dt){
  this.timer-=dt;this.portal=null;this.action='';if(!goal){this.route=[];this.next=null;this.distance=0;this.status='idle';return;}
  const goalKey=[goal.id||'',goal.x,goal.z,goal.y??0].join(':'),playerKey=location(player),gates=this.world.gates?.map(g=>+g.open).join('')||'';
  if(goalKey!==this.goalKey||playerKey!==this.playerKey||gates!==this.gates||this.timer<=0&&this.world.at(player.x,player.z,player.y)?.liftId){this.goalKey=goalKey;this.playerKey=playerKey;this.gates=gates;this.timer=.35;this.plan(player,goal);}
  this.next=null;if(!this.route.length){this.distance=0;this.status='blocked';return;}
  const currentCell=this.world.at(player.x,player.z,player.y),liftId=currentCell?.liftId;
  if(liftId)for(const p of this.route)if(p.liftId===liftId)p.y=player.y;
  this.status='route';let stop=this.route.length-1;const first=this.route[0];
  for(let i=1;i<this.route.length;i++){const p=this.route[i],prior=this.route[i-1];if(p.room!==first.room||p.liftId||p.stair&&!prior.stair){this.portal=p;stop=Math.min(i+1,this.route.length-1);break;}}
  // Only skip waypoints that can actually be walked in a straight line at this elevation.
  for(let i=0;i<=Math.min(stop,12);i++){const p=this.route[i];if(i&&distance(player,p)>20)break;if(!this.clearSegment(player,p))break;if(distance(player,p)>.45)this.next=p;}
  // Follow the tread centers through stair elbows. A diagonal shortcut can step off
  // a descending tread, then point back uphill while the player's feet are falling.
  if(!liftId&&(first.stair||this.route[1]?.stair||player.grounded===false)){
   const ahead=this.route[1];this.next=ahead&&this.clearSegment(player,ahead)?ahead:first;
  }
  if(liftId){const lift=this.world.lifts.find(l=>l.id===liftId),exit=this.route.find(p=>!p.liftId);if(exit&&lift){
   this.elevation=exit.y-player.y;
   if(Math.abs(this.elevation)<=.65&&this.clearSegment(player,exit)){this.next=exit;this.action='EXIT LIFT';}
   else{this.next={x:lift.x,z:lift.z,y:exit.y,liftId};this.action=Math.hypot(player.x-lift.x,player.z-lift.z)>1.2?'BOARD LIFT':Math.abs(lift.y-player.y)>.25?'WAIT FOR LIFT':this.elevation>0?'RIDE UP':'RIDE DOWN';}
  }}
  if(!this.next){const ahead=this.route[1];if(ahead?.liftId){const lift=this.world.lifts.find(l=>l.id===ahead.liftId);this.next={x:ahead.x,z:ahead.z,y:player.y};this.action=lift&&Math.abs(lift.y-player.y)>.5?'WAIT FOR LIFT':'BOARD LIFT';}else if(distance(player,goal)<3.5&&Math.abs(player.y-(goal.y||0))<.6&&this.world.los(player.x,player.z,goal.x,goal.z,player.y+1.2,(goal.y||0)+1.2)){this.next={...goal,y:goal.y||0};this.action='OBJECTIVE';}else{this.next=first;}}
  this.distance=distance(player,first);for(let i=1;i<this.route.length;i++)this.distance+=distance(this.route[i-1],this.route[i]);
  if(!this.action){const climb=this.route.slice(1,7).find(p=>Math.abs(p.y-player.y)>.45);this.elevation=(climb?.y??this.next.y)-player.y;this.action=climb?(this.elevation>0?'STAIRS UP':'STAIRS DOWN'):this.portal?.room==='passage'?'PASSAGE':this.portal?'NEXT ROOM':'OBJECTIVE';}
  const dx=this.next.x-player.x,dz=this.next.z-player.z;if(Math.hypot(dx,dz)>.15)this.relative=wrap(Math.atan2(-dx,-dz)-(player.yaw||0));else this.relative=0;
 }
}
