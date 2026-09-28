// Layered service wings extend the station without flattening crossings into junctions.
export function extendWorld(w){
 const key=(x,z)=>`${x},${z}`,layers=new Map(),baseAt=w.at,baseHeight=w.cellHeight,baseBlocked=w.blocked,baseFloor=w.floor,baseCanMove=w.canMove;
 const byXZ=(x,z)=>layers.get(key(x,z))||[];
 const add=c=>{const k=key(c.x,c.z),base=w.cells.get(k);if(!base){w.cells.set(k,c);return c;}
  if(base.stair&&!c.stair&&Math.abs(base.stair.to-c.y)<.1)return base;
  if(!base.stair&&c.stair&&Math.abs(base.y-c.stair.from)<.1){Object.assign(base,c);return base;}
  if(Math.abs(base.y-c.y)<.1){if(c.stair){Object.assign(base,c);return base;}return base;}
  const list=layers.get(k)||[];if(list.some(a=>Math.abs(a.y-c.y)<.1))return list.find(a=>Math.abs(a.y-c.y)<.1);list.push(c);layers.set(k,list);return c;};
 const west=w.rooms.find(r=>r.id==='west'),minX=Math.min(...[...w.cells.values()].map(c=>c.x)),ox=minX-5,oz=Math.min(west.z2-1,west.cz+4),lo=west.y,hi=lo+6;
 function corridor(points,room){const path=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],steps=Math.abs(b.x-a.x)+Math.abs(b.z-a.z),axis=a.x!==b.x?'x':'z',dir=Math.sign(b[axis]-a[axis]);for(let j=0;j<=steps;j++){const t=steps?j/steps:0,y=a.y+(b.y-a.y)*t,x=a.x+(axis==='x'?j*dir:0),z=a.z+(axis==='z'?j*dir:0),rise=(b.y-a.y)/(steps||1),stair=rise&&j>0?{axis,dir,from:y-rise,to:y}:null;for(let n=-1;n<=1;n++){const c={x:x+(axis==='z'?n:0),z:z+(axis==='x'?n:0),y:stair?Math.min(stair.from,stair.to):y,ceiling:y+3.6,room,style:4+(Math.abs(x+z)%4),gap:false,stair,layer:true};const existing=w.cells.get(key(c.x,c.z));if(room==='service entrance'&&existing)continue;add(c);}path.push({x:x*2+1,z:z*2+1,y});if(stair)w.stairs.push({x,z,...stair,width:3});}}return path;}
 corridor([{x:west.x1-1,z:oz,y:lo},{x:ox-9,z:oz,y:lo}],'service entrance');
 const lower=corridor([{x:ox-9,z:oz,y:lo},{x:ox-9,z:oz-9,y:lo},{x:ox-3,z:oz-9,y:lo},{x:ox-3,z:oz-4,y:lo},{x:ox-15,z:oz-4,y:lo}],'winding service tunnels');
 const upper=corridor([{x:ox-9,z:oz,y:lo},{x:ox-9,z:oz+15,y:hi},{x:ox+2,z:oz+15,y:hi},{x:ox+2,z:oz+8,y:hi},{x:ox-2,z:oz+8,y:hi},{x:ox-2,z:oz+2,y:hi},{x:ox+3,z:oz+2,y:hi},{x:ox+3,z:oz-5,y:hi},{x:ox-1,z:oz-5,y:hi},{x:ox-1,z:oz-16,y:hi},{x:ox-7,z:oz-16,y:hi},{x:ox-7,z:oz-19,y:hi},{x:ox-15,z:oz-19,y:hi},{x:ox-15,z:oz-4,y:lo}],'overhead recovery conduit');
 const deadEnds=[];for(let i=0;i<4;i++){const z=oz-1-i*2,x=ox-9,endX=x-3-(w.seed+i)%3,path=corridor([{x,z,y:lo},{x:endX,z,y:lo},{x:endX,z:z+2,y:lo}],'blind service spur');deadEnds.push(path.at(-1));}
 // Merge shallow duplicate decks created by the widened elbows of the same
 // staircase. They are one stair landing, not a second crawlspace/floor.
 for(const [k,list]of layers){let base=w.cells.get(k),changed=true;while(changed){changed=false;const sorted=[base,...list].sort((a,b)=>a.y-b.y);for(let i=0;i<sorted.length-1;i++){const low=sorted[i],high=sorted[i+1];if(high.y-low.y>=1.8)continue;const keep=low.stair?low:high,drop=keep===low?high:low;keep.ceiling=Math.max(keep.ceiling,drop.ceiling);if(drop===base){base=keep;w.cells.set(k,keep);}const at=list.indexOf(drop);if(at>=0)list.splice(at,1);const duplicate=list.indexOf(base);if(duplicate>=0)list.splice(duplicate,1);changed=true;break;}}if(!list.length)layers.delete(k);}
 // Lower ceilings stop at the underside of a crossing deck, rather than blocking the upper route.
 for(const[k,list]of layers){const sorted=[w.cells.get(k),...list].sort((a,b)=>a.y-b.y);for(let i=0;i<sorted.length-1;i++)sorted[i].ceiling=Math.min(sorted[i].ceiling,sorted[i+1].y-.28);}
 const all=()=>[...w.cells.values(),...[...layers.values()].flat()];
 function at(x,z,feetY){const cx=Math.floor(x/2),cz=Math.floor(z/2),base=w.cells.get(key(cx,cz));if(feetY===undefined||!Number.isFinite(feetY))return base;const candidates=[base,...byXZ(cx,cz)].filter(Boolean).filter(c=>baseHeight(c,x,z)<=feetY+.51);return candidates.sort((a,b)=>baseHeight(b,x,z)-baseHeight(a,x,z)||Number(!!b.stair)-Number(!!a.stair))[0]||base;}
 const gatePhysical=c=>{const g=c?.gate&&w.gates.find(g=>g.id===c.gate);return g&&(!g.open||(g.amount||0)*3.8<1.85);};
 const gateClosed=c=>c?.gate&&!w.gates.find(g=>g.id===c.gate)?.open;
 const obstacleIndex=new Map();let obstacleCount=-1;
 function indexObstacles(){obstacleIndex.clear();for(const o of w.obstacles)for(let x=Math.floor((o.x-o.w/2-.5)/2);x<=Math.floor((o.x+o.w/2+.5)/2);x++)for(let z=Math.floor((o.z-o.d/2-.5)/2);z<=Math.floor((o.z+o.d/2+.5)/2);z++){const k=key(x,z);if(!obstacleIndex.has(k))obstacleIndex.set(k,[]);obstacleIndex.get(k).push(o);}obstacleCount=w.obstacles.length;}
 function nearbyObstacles(x,z,r=0){if(obstacleCount!==w.obstacles.length)indexObstacles();return r>.5?w.obstacles:obstacleIndex.get(key(Math.floor(x/2),Math.floor(z/2)))||[];}
 const occupied=(x,y,z,r=0)=>nearbyObstacles(x,z,r).some(o=>x>o.x-o.w/2-r&&x<o.x+o.w/2+r&&z>o.z-o.d/2-r&&z<o.z+o.d/2+r&&y<o.y+o.h&&y+1.7>o.y);
 function floor(x,z,y=Infinity){const c=at(x,z,y);if(!c||c.gap)return null;if(c.liftId)return baseFloor(x,z,y);return baseHeight(c,x,z);}
 function canMove(x,z,r=.3,y=Infinity){return[[r,r],[r,-r],[-r,r],[-r,-r]].every(([dx,dz])=>{const c=at(x+dx,z+dz,y);if(!c||gatePhysical(c)||(Number.isFinite(y)&&occupied(x+dx,y,z+dz)))return false;const f=floor(x+dx,z+dz,y);return(f===null||f<=y+.51)&&(!Number.isFinite(y)||c.ceiling>=y+1.8);});}
 function blocked(x,y,z){const c=at(x,z,y-.9);if(!c||gateClosed(c)||nearbyObstacles(x,z).some(o=>x>o.x-o.w/2&&x<o.x+o.w/2&&z>o.z-o.d/2&&z<o.z+o.d/2&&y>o.y&&y<o.y+o.h))return true;const f=baseHeight(c,x,z);if(!c.gap&&y<f-.05||y>c.ceiling)return true;if(c.liftId){const lift=w.lifts.find(l=>l.id===c.liftId);if(y>lift.y-.25&&y<lift.y)return true;}return false;}
 function los(x,z,tx,tz,y=null,ty=null){y??=(at(x,z)?.y||0)+1;ty??=(at(tx,tz)?.y||0)+1;const count=Math.ceil(Math.hypot(tx-x,tz-z,ty-y)/.55);for(let i=1;i<=count;i++)if(blocked(x+(tx-x)*i/count,y+(ty-y)*i/count,z+(tz-z)*i/count))return false;return true;}
 let huntCache=new Map();
 function huntWaypoint(x,z,target,startY){const gateKey=w.gates.map(g=>+g.open).join(''),key=[Math.floor(target.x/2),Math.floor(target.z/2),Math.round(target.y*2),gateKey,Math.floor((w.aiTime||0)*2)].join(':');let to=huntCache.get(key);if(!to){to=routesFrom(target.x,target.z,{startY:target.y});if(huntCache.size>8)huntCache.clear();huntCache.set(key,to);}const path=to(x,z,startY);return path?.[Math.max(0,path.length-2)]||null;}
 const nodeKey=c=>key(c.x,c.z)+','+c.y.toFixed(4),center=c=>({x:c.x*2+1,z:c.z*2+1,y:baseHeight(c,c.x*2+1,c.z*2+1),liftId:c.liftId,room:c.room,link:c.link,stair:!!c.stair});
 const edgeCache=new Map();
 function clearEdge(c,n,dx,dz){
  if(!w.walkEdge(c,n,dx,dz))return false;const k=nodeKey(c)+'>'+nodeKey(n);if(edgeCache.has(k))return edgeCache.get(k);
  const a=center(c),b=center(n);let clear=true;
  for(let i=0;i<=8&&clear;i++){const t=i/8,x=a.x+dx*2*t,z=a.z+dz*2*t,expected=a.y+(b.y-a.y)*t,actual=floor(x,z,expected);if(actual===null){clear=false;break;}
   for(const[ox,oz]of [[.3,.3],[.3,-.3],[-.3,.3],[-.3,-.3]]){const cell=at(x+ox,z+oz,actual),f=cell&&baseHeight(cell,x+ox,z+oz);if(!cell||cell.ceiling<actual+1.8||f>actual+.51||occupied(x+ox,actual,z+oz)){clear=false;break;}}
  }edgeCache.set(k,clear);return clear;
 }
 function searchPaths(x,z,options={},end=null){const start=at(x,z,options.startY),prev=new Map();if(!start)return prev;const q=[start];prev.set(nodeKey(start),null);
  for(let i=0;i<q.length;i++){const c=q[i];if(c===end)break;for(const[dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const cx=c.x+dx,cz=c.z+dz;for(const n of[w.cells.get(key(cx,cz)),...byXZ(cx,cz)]){if(!n||n.gap||n.ceiling<n.y+1.8||occupied(cx*2+1,n.y,cz*2+1,.3)||prev.has(nodeKey(n))||!options.ignoreGates&&gateClosed(n))continue;if(!clearEdge(c,n,dx,dz)&&!(options.includeLifts&&(c.liftId||n.liftId)))continue;prev.set(nodeKey(n),c);q.push(n);}}}return prev;
 }
 function tracePath(prev,end){if(!end||!prev.has(nodeKey(end)))return null;const path=[];let c=end;while(c){path.push(center(c));c=prev.get(nodeKey(c));}return path.reverse();}
 function waypoint(x,z,tx,tz,options={}){const end=at(tx,tz,options.endY);if(!end)return null;const path=tracePath(searchPaths(x,z,options,end),end);return!path?null:options.fullPath?path:path[Math.min(1,path.length-1)];}
 // One traversal supplies every compass destination without one BFS per marker.
 function routesFrom(x,z,options={}){const prev=searchPaths(x,z,options);return(tx,tz,endY)=>tracePath(prev,at(tx,tz,endY));}
 Object.assign(w,{layers,renderCells:all,at,floor,canMove,blocked,los,waypoint,routesFrom,huntWaypoint,invalidateRoutes:()=>{edgeCache.clear();indexObstacles();},deadEnds,overpass:{lower,upper,goal:upper[Math.floor(upper.length*.68)]},layerCount:[...layers.values()].reduce((n,a)=>n+a.length,0)});
 const values=all();w.bounds={x1:Math.min(...values.map(c=>c.x))*2,z1:Math.min(...values.map(c=>c.z))*2,x2:(Math.max(...values.map(c=>c.x))+1)*2,z2:(Math.max(...values.map(c=>c.z))+1)*2};
 for(let i=0;i<deadEnds.length;i++)w.supplies.push({...deadEnds[i],y:floor(deadEnds[i].x,deadEnds[i].z,deadEnds[i].y)??deadEnds[i].y,kind:i%2?'ammo':'scrap',gun:'bolt',amount:75});
 return w;
}
