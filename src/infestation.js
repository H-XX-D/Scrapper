import{tentacleSpan}from'./tentacle-path.js';
import{rng}from'./world.js';
export const GROWTH_COLORS=['#b4ec42','#6bebff','#cd8bff','#ffaf42'];
export const GROWTH_GOO=['green','cyan','violet','oil'];
// Simulation contains only data: hosts own growth, saves and room frames share it.
export class Infestation{
 constructor(world,{enabled=true,limit=96}={}){
  this.world=world;this.limit=limit;this.clock=0;this.patches=[];this.anchors=[];
  const random=rng(world.seed^0x76b0f5bd),cells=world.renderCells();
  for(const c of cells){
   if(c.gap||c.stair||c.liftId||c.gate||c.room==='arrival'||c.ceiling-c.y<3)continue;
   const x=c.x*2+1,z=c.z*2+1;
   if([world.control,world.purge,world.exit,...world.switches].some(p=>Math.hypot(p.x-x,p.z-z,p.y-c.y)<4))continue;
   for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){
    if(world.at(x+dx*2,z+dz*2,c.y))continue;
    // Stay on three continuous wall panels, away from door jambs and corners.
    if([-1,1].some(s=>{const a=world.at(x-dz*s*2,z+dx*s*2,c.y);return!a||a.stair||Math.abs(a.y-c.y)>.1||world.at(x+dx*2-dz*s*2,z+dz*2+dx*s*2,c.y);}))continue;
    const ax=x+dx*.96,az=z+dz*.96;
    this.anchors.push({id:this.anchors.length,x:ax,z:az,y:c.y+1.65,floor:c.y,nx:-dx||0,nz:-dz||0,room:c.room,roll:random()});
   }
  }
  // Append surface anchors so existing wall IDs in saved recoveries stay stable.
  for(const c of cells){if(c.gap||c.stair||c.liftId||c.gate||c.room==='arrival'||c.ceiling-c.y<3)continue;const x=c.x*2+1,z=c.z*2+1;if(!world.canMove(x,z,.5,c.y)||[world.control,world.purge,world.exit,...world.switches,...world.cases].some(p=>Math.hypot(p.x-x,p.z-z,p.y-c.y)<4))continue;for(const surface of['floor','ceiling'])this.anchors.push({id:this.anchors.length,x,z,y:surface==='floor'?c.y+.05:c.ceiling-.05,floor:c.y,nx:0,nz:0,ny:surface==='floor'?1:-1,surface,room:c.room,roll:random()});}
  if(!enabled)return;
  // Room-by-room selection gives every branch infestation without sealing routes.
  for(const room of [...world.rooms.map(r=>r.id),'passage']){
   const candidates=this.anchors.filter(a=>a.room===room&&!a.surface).sort((a,b)=>a.roll-b.roll);
   let count=0;for(const a of candidates){if(count>=(room==='passage'?18:5))break;if(this.patches.some(p=>Math.hypot(p.x-a.x,p.z-a.z,p.y-a.y)<5))continue;this.add(a.id,Math.floor(a.roll*997)%4,.22+a.roll*.78);count++;}
  }
  for(const room of world.rooms.filter(r=>r.id!=='arrival'))for(const surface of['ceiling','floor']){const a=this.anchors.filter(a=>a.room===room.id&&a.surface===surface).sort((a,b)=>a.roll-b.roll).find(a=>this.patches.every(p=>Math.hypot(p.x-a.x,p.z-a.z)>3.5));if(a)this.add(a.id,Math.floor(a.roll*997)%4,.65);}

 }
 add(anchor,type,maturity=0){if(this.patches.length>=this.limit||this.patches.some(p=>p.anchor===anchor))return null;const a=this.anchors[anchor];if(!a)return null;const p={...a,id:anchor,anchor,type,maturity,hp:48+type*8,age:0,spreadIn:14+a.roll*12,dead:false,burn:0,reach:Math.max(2.6+a.roll*2.5,a.surface==='ceiling'?a.y-a.floor-.65:0),tentacleState:'idle',tentacleAge:0,grabCooldown:2+a.roll*3};delete p.roll;p.span=tentacleSpan(this.world,p);p.extension=0;this.patches.push(p);return p;}
 hit(id,damage,flame=false){const p=this.patches.find(p=>p.id===id);if(!p||p.dead)return null;p.hp=Math.max(0,p.hp-damage*(flame?1.8:1));p.burn=flame?.32:p.burn;if(p.hp===0){p.dead=true;p.burn=0;p.deathAge=0;}return p;}
 tick(dt){this.clock+=dt;const growing=this.patches.slice();for(const p of growing){p.age+=dt;p.burn=Math.max(0,p.burn-dt);if(p.dead){p.deathAge=(p.deathAge||0)+dt;continue;}p.maturity=Math.min(1,p.maturity+dt/28);if(p.maturity<1)continue;p.spreadIn-=dt;if(p.spreadIn>0)continue;p.spreadIn=24+(p.id%9);const candidates=this.anchors.filter(a=>a.room===p.room&&Math.abs(a.y-p.y)<.2&&Math.hypot(a.x-p.x,a.z-p.z)>=2&&Math.hypot(a.x-p.x,a.z-p.z)<=7&&!this.patches.some(other=>other.anchor===a.id||Math.hypot(other.x-a.x,other.z-a.z,other.y-a.y)<2.9)).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));if(candidates.length)this.add(candidates[0].id,p.type);}}
 frame(p){return p.dead?7:p.maturity<.3?0:p.maturity<.6?1:p.maturity<.9?2:3+Math.floor(p.age*5)%4;}
 snapshot(){return{clock:this.clock,patches:this.patches.map(p=>({...p}))};}
 restore(s){if(!s)return;this.clock=s.clock||0;this.patches=(s.patches||[]).map(p=>({reach:3.5,tentacleState:'idle',tentacleAge:0,grabCooldown:2,...p}));}
}
