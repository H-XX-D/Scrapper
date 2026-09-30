import test from 'node:test';
import assert from 'node:assert/strict';
import {makeWorld} from '../src/world.js';
import {MissionTasks,traceMirrors} from '../src/mission-tasks.js';
import {CampaignStore,validateCampaignSave} from '../src/campaign-save.js';
import {Arsenal} from '../src/combat.js';
import {encounterPlan,INTRODUCTIONS} from '../src/encounters.js';
import {ACTORS,WEAPONS,PILOTS} from '../src/catalog.js';
import {enemyMultiplier,canHurtPlayer,hitPlayer,updateRevives,directionalFrame} from '../src/crew.js';
import {sanitizeInput,cleanCode} from '../src/network.js';
import {RouteGuide} from '../src/navigation.js';
import {movePlayer} from '../src/traversal.js';
import {SPECS} from '../src/atlas.js';

function powered(chapter){const t=new MissionTasks(makeWorld(2709,chapter%4),chapter);for(const f of t.fuses)assert.ok(t.use(f.id).accepted);assert.ok(t.use(t.socket.id).accepted);return t;}
test('four puzzle mechanics require their respective input, reject shortcuts and reach completion',()=>{
 const pressure=powered(0);assert.equal(pressure.use('coupler-a').accepted,false);for(let i=0;i<3;i++)if(pressure.target&(1<<i))pressure.use('pressure-'+i);assert.ok(pressure.solved);
 const mirrors=powered(1);assert.equal(traceMirrors(mirrors.mirrors).solved,false);for(let i=0;i<4;i++)mirrors.use('mirror-'+i);assert.ok(mirrors.solved);
 const timing=powered(2);assert.ok(timing.use('sync-2').wrong);for(let i=0;i<3;i++){timing.clock=[.18,.5,.82][i]*2.4;assert.ok(timing.use('sync-'+i).accepted);}assert.ok(timing.solved);
 const coolant=powered(3);assert.equal(coolant.use('coolant-return').accepted,false);const helper={...coolant.pump,hp:100,revive:true};coolant.tick(1,[helper]);coolant.tick(1,[]);assert.equal(coolant.charge,0);coolant.tick(3.1,[helper]);assert.ok(coolant.remaining>0);assert.ok(coolant.use('coolant-return').accepted);assert.ok(coolant.solved);
});
test('mission nodes and upper recovery conduits are reachable at their actual elevation',()=>{
 for(let theme=0;theme<4;theme++)for(let seed=1;seed<=20;seed++){const w=makeWorld(seed,theme),t=new MissionTasks(w,theme+4);for(const n of t.nodes)assert.ok(w.waypoint(w.start.x,w.start.z,n.x,n.z,{startY:w.start.y,endY:n.y,fullPath:true,ignoreGates:true}),`${theme}/${seed}/${n.id}`);assert.ok(w.layerCount>0);}
});
test('player physics walks the overhead crossing route without a teleport or tall ceiling',()=>{
 for(let theme=0;theme<4;theme++){const w=makeWorld(2709,theme),goal=w.overpass.goal,p={...w.start,yaw:0,vy:0,grounded:true,safe:{...w.start}},path=w.waypoint(p.x,p.z,goal.x,goal.z,{startY:p.y,endY:goal.y,fullPath:true});assert.ok(path);let k=1,stuck=0;for(let f=0;f<18000&&k<path.length;f++){const q=path[k],dx=q.x-p.x,dz=q.z-p.z;if(Math.hypot(dx,dz)<.17){k++;continue;}p.yaw=Math.atan2(-dx,-dz);const before={...p};w.tick(1/60,p);movePlayer(p,w,1/60,{forward:1,sprint:true});stuck=Math.hypot(p.x-before.x,p.z-before.z)<.001?stuck+1:0;if(stuck>60)break;}assert.equal(k,path.length,`theme ${theme}: ${JSON.stringify(p)} -> ${JSON.stringify(path[k])}`);assert.ok(Math.abs(p.y-goal.y)<.2);}
});
test('route compass follows the passage and recalculates from the traveled deck',()=>{
 const w=makeWorld(2709,2),g=new RouteGuide(w);g.update(w.start,w.overpass.goal,.1);assert.ok(g.route.length>20);assert.ok(g.distance>Math.hypot(w.start.x-w.overpass.goal.x,w.start.z-w.overpass.goal.z));const p=g.route[30];g.update({...p,yaw:0},w.overpass.goal,1);assert.ok(g.route.length>0);assert.ok(Math.hypot(g.route[0].x-p.x,g.route[0].z-p.z)<2);
});
test('co-op uses smaller paced encounters instead of duplicating every monster per player',()=>{
 for(const chapter of [0,1,3,7,11]){const solo=encounterPlan(makeWorld(2709,chapter%4),chapter,1,'solo');assert.ok(solo.length>=30&&solo.length<=105);for(const e of solo)if(ACTORS[e.type].tier==='ENEMY')assert.ok((INTRODUCTIONS[e.type]||0)<=chapter);for(let n=1;n<=4;n++){const coop=encounterPlan(makeWorld(2709,chapter%4),chapter,n,'coop');assert.ok(coop.length>=solo.length&&coop.length<=solo.length+12);assert.deepEqual(coop.filter(e=>ACTORS[e.type].tier==='BOSS').map(e=>e.type),solo.filter(e=>ACTORS[e.type].tier==='BOSS').map(e=>e.type));assert.equal(enemyMultiplier('coop',n),1);}assert.equal(encounterPlan(makeWorld(2709),chapter,4,'ffa').length,0);assert.equal(encounterPlan(makeWorld(2709,chapter%4),chapter,4,'pvpve').length,solo.length);}
});
test('co-op downs and uninterrupted E revives; versus kills and friendly fire is mode-specific',()=>{
 const a={id:'a',player:{x:0,y:0,z:0,hp:100}},b={id:'b',player:{x:2,y:0,z:0,hp:20}},world={los:()=>true};assert.ok(hitPlayer(b,30,{mode:'coop',attacker:'a'}));assert.ok(b.player.down);assert.equal(canHurtPlayer('coop','a','b'),false);assert.equal(canHurtPlayer('ffa','a','b'),true);assert.equal(canHurtPlayer('pvpve','a','b'),true);assert.equal(canHurtPlayer('ffa','a','a'),false);let holding=true;const input=()=>({revive:holding,fire:false});updateRevives([a,b],1,world,input);holding=false;updateRevives([a,b],.1,world,input);assert.equal(b.player.revive,0);holding=true;assert.equal(updateRevives([a,b],3.1,world,input).length,1);assert.equal(b.player.hp,40);assert.equal(b.player.down,false);b.player.hurtCooldown=0;hitPlayer(b,100,{mode:'pvpve'});assert.equal(b.player.dead,true);assert.equal(b.player.down,false);
});
test('every crew/weapon combination has sixteen directional frames and complete movement pairs',()=>{
 for(const pilot of Object.keys(PILOTS))for(const weapon of WEAPONS){const spec=SPECS['crew-'+pilot+'-'+weapon.id];assert.ok(spec.walkFrames>=2);assert.ok(spec.rows*spec.cols>=spec.walkFrames*16);assert.equal(spec.rects.flat().length,spec.rows*spec.cols);for(let d=0;d<16;d++){const a=d*Math.PI*2/16,frame=directionalFrame(0,{x:-Math.sin(a)*10,z:-Math.cos(a)*10},{x:0,z:0});assert.equal(frame.direction,d);assert.ok(frame.col<8&&frame.row<2);}}
});
test('solo saves restore decisions, tasks, score, health and exact ammo in independent slots',()=>{
 const data=new Map(),store=new CampaignStore({getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)}),a=new Arsenal();a.fire();a.unlock('frost');const t=powered(0);t.use('pressure-2');const state={chapter:0,seed:2709,pilot:'eos',score:135,player:{x:12,y:3,z:9,hp:57,yaw:1,pitch:.2},arsenal:a,mission:{record:true,power:'maintenance',choices:[{id:'power',value:'maintenance'}]},tasks:t.snapshot(),actors:[],nests:[],campaign:[]};store.save(0,state,'Recovery');const serialized=store.export(0);store.import(serialized,2);const restored=store.load(2).state;assert.equal(restored.score,135);assert.equal(restored.player.hp,57);assert.equal(restored.arsenal.slots.bolt.mag,23);assert.ok(restored.arsenal.slots.frost.owned);assert.deepEqual(restored.mission,state.mission);assert.deepEqual(restored.tasks,t.snapshot());assert.equal(store.load(1),null);assert.equal(validateCampaignSave({version:1,state}),null);assert.throws(()=>store.import('{}'));
});
test('network input sanitization rejects invalid sequences, clamps motion and allows no arbitrary actions',()=>{
 assert.equal(sanitizeInput({seq:NaN}),null);const d=sanitizeInput({seq:1,forward:999,strafe:-999,pitch:99,weapon:'admin',fire:'true',actions:{reload:2,eval:1000}});assert.equal(d.forward,1);assert.equal(d.strafe,-1);assert.equal(d.pitch,1.25);assert.equal(d.weapon,'bolt');assert.equal(d.fire,false);assert.equal(d.actions.reload,2);assert.equal(d.actions.eval,undefined);assert.equal(cleanCode('ab c234!'),'ABC234');
});
