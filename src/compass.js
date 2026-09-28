import{RouteGuide}from'./navigation.js';
export const COMPASS_LIMIT=20;
export const COMPASS_COLORS={objective:'#55d8ff',supply:'#ffd45a',enemy:'#ff4d53'};
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const separation=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z,(a.y||0)-(b.y||0));
export function compassProjection(relative){const side=relative>Math.PI/2?'left':relative< -Math.PI/2?'right':'';return{x:Math.max(2,Math.min(98,50-relative/(Math.PI/2)*48)),edge:side};}
export function compassTargets({world,tasks,mission,primary,cases=[],pickups=[],actors=[],crew=[],self,mode='solo'}){
 const result=[],seen=new Set();
 const add=(id,kind,p,label,main=false)=>{if(!p)return;const y=p.groundY??p.y??0,key=kind==='objective'?kind+':'+p.x+':'+p.z+':'+y:id;if(seen.has(key))return;seen.add(key);result.push({id,kind,label,x:p.x,z:p.z,y,primary:main});};
 const discovered=p=>{const room=world.at(p.x,p.z,p.y||0)?.room;return!room?.startsWith('secret-')||world.secrets.some(s=>s.room===room&&s.found);};
 if(mode!=='ffa'){
  add('main','objective',primary,primary?.label||'CURRENT OBJECTIVE',true);
  if(!tasks.solved)for(const n of tasks.nodes)if(tasks.interactable?.(n)??tasks.visible(n))add('task:'+n.id,'objective',n,n.label);
  if(!world.accessCard.taken&&tasks.solved)add('access','objective',world.accessCard,'BLUE ACCESS');
  if(!mission.record)add('archive','objective',world.control,'RECOVERY ARCHIVE');
  if(!mission.choices.some(c=>c.id==='purge'))add('research','objective',world.purge,'RESEARCH BANK');
  if(tasks.solved&&!world.puzzle.solved)for(const n of world.switches)if(!n.timedGate&&!n.on)add('relay:'+n.id,'objective',n,'RELAY '+(n.index+1));
 }
 for(const [i,c]of cases.entries())if(!c.open&&(!c.locked||mission.power==='armory')&&discovered(c))add('case:'+i,'supply',c,'WEAPON CASE');
 for(const [i,p]of pickups.entries())if(!p.taken&&p.age>=(p.delay||0)&&discovered(p))add('pickup:'+i,'supply',p,p.kind.toUpperCase());
 for(const s of world.secrets)if(s.found)add('secret:'+s.id,'supply',s,'DISCOVERED SECRET');
 for(const a of actors)if(a.hp>0)add('enemy:'+a.id,'enemy',a,a.type.toUpperCase());
 if(mode==='ffa'||mode==='pvpve')for(const m of crew)if(m.id!==self&&m.player.hp>0)add('rival:'+m.id,'enemy',m.player,'RIVAL SALVAGER');
 return result;
}
export class CompassContacts{
 constructor(world){this.world=world;this.guides=new Map();this.timer=0;this.key='';this.contacts=[];this.revision=0;}
 update(player,targets,dt,primaryGuide){
  this.timer-=dt;
  const key=[Math.floor(player.x/2),Math.floor(player.z/2),Math.round((player.y||0)*2),this.world.gates.map(g=>+g.open).join(''),...targets.filter(t=>t.kind!=='enemy').map(t=>t.id+':'+t.x+':'+t.z)].join('|');
  const refresh=key!==this.key||!this.reachable;
  if(refresh){this.key=key;this.timer=.25;this.revision++;
   const pathTo=this.world.routesFrom(player.x,player.z,{startY:player.y,includeLifts:true});
   const routedWorld=Object.create(this.world);routedWorld.waypoint=(x,z,tx,tz,o={})=>pathTo(tx,tz,o.endY);
   const live=new Set(targets.map(t=>t.id));for(const id of this.guides.keys())if(!live.has(id))this.guides.delete(id);
   this.reachable=targets.filter(t=>t.kind!=='enemy').flatMap(t=>{
    const guide=t.primary&&primaryGuide?primaryGuide:new RouteGuide(routedWorld);if(guide!==primaryGuide)guide.update(player,t,0);
    this.guides.set(t.id,guide);return guide.next?[t.id]:[];
   });
  }
  const reachable=new Set(this.reachable),valid=targets.filter(t=>t.kind==='enemy'||reachable.has(t.id));
  // Reserve the current objective, then take the closest remaining contacts.
  valid.sort((a,b)=>Number(!!b.primary)-Number(!!a.primary)||separation(player,a)-separation(player,b)||a.id.localeCompare(b.id));
  const selected=valid.slice(0,COMPASS_LIMIT),lanes=[];
  this.contacts=selected.map(t=>{
   const guide=t.primary&&primaryGuide?primaryGuide:this.guides.get(t.id),point=t.kind==='enemy'?t:guide.next;
   const dx=point.x-player.x,dz=point.z-player.z,relative=Math.hypot(dx,dz)<.15?0:wrap(Math.atan2(-dx,-dz)-(player.yaw||0)),projected=compassProjection(relative);
   const near=lanes.filter(p=>Math.abs(p.x-projected.x)<1.8),lane=near.length%3;lanes.push(projected);
   return{...t,target:{x:t.x,y:t.y,z:t.z},...projected,lane,relative,distance:separation(player,t),routeDistance:t.kind==='enemy'?null:guide.distance,next:{...point},action:t.kind==='enemy'?'ENEMY':guide.action,elevation:t.y-(player.y||0)};
  });return this.contacts;
 }
}
export class CompassView{
 constructor(scale,layer){this.layer=layer;this.nodes=new Map();this.labels=[];
  for(let i=0;i<16;i++){const n=document.createElement('span');n.className=i%2?'compass-graduation':'compass-cardinal';n.textContent=i%2?'│':['N','NE','E','SE','S','SW','W','NW'][i/2];scale.append(n);this.labels.push(n);}
 }
 render(contacts,yaw){
  this.labels.forEach((n,i)=>{const relative=wrap(-i*Math.PI/8-yaw),p=compassProjection(relative);n.hidden=!!p.edge||Math.abs(p.x-50)<9;n.style.left=p.x+'%';});
  const live=new Set(contacts.map(c=>c.id));for(const[id,n]of this.nodes)if(!live.has(id)){n.remove();this.nodes.delete(id);}
  for(const c of contacts){let n=this.nodes.get(c.id);if(!n){n=document.createElement('span');n.innerHTML='<svg viewBox="0 0 11 11" aria-hidden="true"><path d="M4 0h3v2h2v2h2v3H9v2H7v2H4V9H2V7H0V4h2V2h2Z"/><path class="tick-core" d="M4 4h3v3H4Z"/></svg><i></i>';this.layer.append(n);this.nodes.set(c.id,n);}
   n.className='compass-contact '+c.kind+(c.primary?' primary':'');n.dataset.id=c.id;n.dataset.kind=c.kind;n.dataset.edge=c.edge;n.dataset.elevation=Math.abs(c.elevation)<1?'same':c.elevation>0?'up':'down';n.style.left=c.x+'%';n.style.setProperty('--lane',c.lane);n.setAttribute('aria-label',c.label+(c.primary?' · current objective':'')+' · '+Math.ceil(c.routeDistance??c.distance)+'m'+(Math.abs(c.elevation)>=1?c.elevation>0?' · upper deck':' · lower deck':''));
  }
 }
}
