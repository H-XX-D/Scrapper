import{ACTORS}from'./catalog.js';
export const INTRODUCTIONS={beetle:0,crawler:0,spitter:0,splitter:1,drone:2,tank:2,leech:3,jelly:3,bomber:4,lancer:4,scorpion:5,priest:5,bat:6,warden:6,worm:1,shardling:2,spider:7};
const substitute={drone:'beetle',tank:'crawler',bomber:'crawler',lancer:'beetle',warden:'spitter',leech:'crawler',jelly:'spitter',scorpion:'beetle',priest:'spitter',bat:'crawler',shardling:'crawler',spider:'drone'};
export function encounterPlan(world,chapter=0,players=1,mode='solo'){
 if(mode==='ffa')return[];const base=[],out=[],multiplier=mode==='coop'?Math.max(1,Math.min(4,players)):1;
 for(const e of world.encounters){let type=e.type;while((INTRODUCTIONS[type]??0)>chapter)type=substitute[type]||'beetle';base.push({...e,type});}
 for(const r of world.rooms){if(r.id==='arrival')continue;const count=(r.id==='lock'?5:10)+Math.min(8,Math.floor(chapter*.75));for(let n=0;n<count;n++)base.push({...r.center,type:n%5===0?'spitter':n%3?'crawler':'beetle'});}
 for(const p of world.deadEnds||[])base.push({...p,type:chapter>2?'leech':'crawler'});
 for(const e of base)for(let n=0;n<multiplier;n++){let position=null;for(let tries=0;tries<120;tries++){const angle=world.random()*Math.PI*2,r=.8+world.random()*(tries<60?8:15),x=e.x+Math.cos(angle)*r,z=e.z+Math.sin(angle)*r;if(world.canMove(x,z,.5,e.y)&&world.floor(x,z,e.y)!==null&&Math.hypot(x-world.start.x,z-world.start.z)>13&&out.every(p=>Math.hypot(p.x-x,p.z-z,p.y-e.y)>1.05)){position={x,z,y:world.floor(x,z,e.y)};break;}}if(!position)position={x:e.x,z:e.z,y:e.y};out.push({...position,type:e.type});}
 return out;
}
