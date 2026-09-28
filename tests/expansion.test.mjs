import test from'node:test';import assert from'node:assert/strict';
import{makeWorld}from'../src/world.js';import{movePlayer}from'../src/traversal.js';import{rollLoot,nextOwnedWeapon}from'../src/loot.js';import{Arsenal}from'../src/combat.js';import{CHAPTERS,STRAINS,campaignEnding}from'../src/campaign.js';
const playerAt=p=>({...p,yaw:0,vy:0,grounded:true,safe:{...p}});
test('all four layouts stay compact with low ceilings and multilevel routes across 100 seeds',()=>{
 for(let theme=0;theme<4;theme++)for(let seed=1;seed<=100;seed++){
  const w=makeWorld(seed,theme);assert.ok(w.cells.size>2000&&w.cells.size<4500);assert.ok(w.bounds.z2-w.bounds.z1<260);assert.ok(w.rooms.every(r=>r.height<=4.6));assert.ok(w.stairs.length>=30);assert.equal(w.lifts.length,2);
  assert.ok(new Set([...w.cells.values()].map(c=>c.y)).size>12);
  for(const p of[w.control,w.accessCard,w.exit,...w.cases])assert.ok(w.waypoint(w.start.x,w.start.z,p.x,p.z,{ignoreGates:true}),`${theme}/${seed} unreachable ${p.gun||'objective'}`);
  for(let a=0;a<w.cases.length;a++)for(let b=a+1;b<w.cases.length;b++)assert.ok(Math.hypot(w.cases[a].x-w.cases[b].x,w.cases[a].z-w.cases[b].z)>12,'guns clustered');
 }
});
test('relay order rejects mistakes, resets lights, commits once and gates the arena with the access card',()=>{
 const w=makeWorld();assert.equal(w.waypoint(w.start.x,w.start.z,w.exit.x,w.exit.z),null);assert.equal(w.useGate('security').accepted,false);
 const wrong=(w.puzzle.order[0]+1)%3;assert.ok(w.useSwitch('relay-'+wrong).wrong);assert.deepEqual(w.puzzle.input,[]);assert.ok(w.switches.every(s=>!s.on));
 for(const index of w.puzzle.order)assert.ok(w.useSwitch('relay-'+index).accepted);assert.ok(w.puzzle.solved);assert.equal(w.useSwitch('relay-0').accepted,false);
 assert.equal(w.useGate('security').accepted,false);w.accessCard.taken=true;assert.ok(w.useGate('security').accepted);assert.ok(w.waypoint(w.start.x,w.start.z,w.exit.x,w.exit.z));
});
test('automatic lifts carry standing players to both decks without a jump or teleport',()=>{
 for(let theme=0;theme<4;theme++){const w=makeWorld(2709,theme);for(const l of w.lifts){l.y=l.low;l.wait=0;l.direction=1;const p=playerAt({x:l.x,z:l.z,y:l.low});let peak=p.y,returned=false;for(let frame=0;frame<1900;frame++){w.tick(1/60,p);movePlayer(p,w,1/60);peak=Math.max(peak,p.y);if(peak>=l.high-.02&&p.y<=l.low+.02){returned=true;break;}}assert.ok(Math.abs(peak-l.high)<.03,`${theme}/${l.id} top`);assert.ok(returned,`${theme}/${l.id} return`);}}
});
test('the same movement used in the game walks every stair route to the control deck',()=>{
 for(let theme=0;theme<4;theme++){const w=makeWorld(2709,theme),p=playerAt(w.start),route=w.waypoint(p.x,p.z,w.control.x,w.control.z,{fullPath:true});assert.ok(route);let k=1,stuck=0;
  for(let frame=0;frame<30000&&k<route.length;frame++){const target=route[k],dx=target.x-p.x,dz=target.z-p.z;if(Math.hypot(dx,dz)<.16){k++;continue;}p.yaw=Math.atan2(-dx,-dz);const before={x:p.x,z:p.z};w.tick(1/60,p);movePlayer(p,w,1/60,{forward:1,sprint:true});if(Math.hypot(p.x-before.x,p.z-before.z)<.001)stuck++;else stuck=0;if(stuck>30)break;}
  assert.equal(k,route.length,`theme ${theme} stuck at ${p.x.toFixed(2)},${p.z.toFixed(2)},${p.y.toFixed(2)} -> ${JSON.stringify(route[k])}`);assert.ok(Math.abs(p.y-w.control.y)<.2);
 }
});
test('timed secret shutter expires, protects the doorway, and always allows exit from inside',()=>{
 const w=makeWorld(),g=w.gates.find(g=>g.timed);assert.equal(w.useGate(g.id,{x:g.x-4*g.inward,z:g.z}).accepted,false);w.useSwitch('timer');assert.ok(g.open);w.tick(12.1,{x:g.x,z:g.z});assert.ok(g.open);w.tick(.3,{x:g.x+10*g.inward,z:g.z});assert.equal(g.open,false);assert.ok(w.useGate(g.id,{x:g.x+2*g.inward,z:g.z}).accepted);
 const secret=w.secrets.find(s=>s.id===g.id);assert.ok(w.discover(secret.x,secret.z));assert.equal(w.discover(secret.x,secret.z),null);
});
test('RNG scrap and health rolls are independent and wheel selection wraps only owned guns',()=>{
 const both=rollLoot(()=>0);assert.deepEqual(both.map(d=>d.kind),['scrap','health','ammo']);assert.deepEqual(rollLoot(()=>.99),[]);
 const a=new Arsenal();assert.equal(nextOwnedWeapon(a,1),'bolt');a.unlock('frost');a.unlock('beam');assert.equal(nextOwnedWeapon(a,1),'frost');a.equip('frost');assert.equal(nextOwnedWeapon(a,1),'bolt');assert.equal(nextOwnedWeapon(a,-1),'beam');
});
test('twelve playable contracts cover three strains and preserve-vs-purge affects the ending',()=>{
 assert.equal(CHAPTERS.length,12);assert.equal(STRAINS.length,3);assert.equal(new Set(CHAPTERS.map(c=>c.title)).size,12);
 for(const c of CHAPTERS){assert.ok(c.theme>=0&&c.theme<4);for(const field of['intro','discovery','record','guardian','exit'])assert.ok(c[field].length>60);}
 const result=value=>Array.from({length:7},()=>({choices:[{id:'purge',value}]}));assert.notEqual(campaignEnding(result('preserve')),campaignEnding(result('purge')));
});
