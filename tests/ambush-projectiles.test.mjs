import test from'node:test';import assert from'node:assert/strict';
import{movePlayer}from'../src/traversal.js';
import{projectileDirection,directionalFrame}from'../src/player-projectiles.js';import{ClingerPods,clingerPodPlan,POD_BROODS,clingerLaunchPoint}from'../src/clinger-pods.js';import{makeWorld}from'../src/world.js';import{makeActor,updateActor}from'../src/combat.js';import{attachParasite}from'../src/parasites.js';import{tickTentacles,TENTACLE_TELL,TENTACLE_STRIKE}from'../src/tentacles.js';
test('sixteen viewing directions distinguish front, rear and mirrored side profiles for every observer',()=>{
 const a={x:0,y:1,z:1},b={x:0,y:1,z:-1},p={x:0,y:1,z:0};
 assert.equal(projectileDirection(a,b,p,{x:0,z:4}),0);assert.equal(projectileDirection(a,b,p,{x:4,z:0}),4);assert.equal(projectileDirection(a,b,p,{x:0,z:-4}),8);assert.equal(projectileDirection(a,b,p,{x:-4,z:0}),12);
 const views=new Set();for(let i=0;i<16;i++)views.add(projectileDirection(a,b,p,{x:4*Math.sin(i*Math.PI/8),z:4*Math.cos(i*Math.PI/8)}));assert.equal(views.size,16);
 for(const gun of['rockets','flame','beam']){const frames=new Set([...views].map(v=>JSON.stringify(directionalFrame(gun,v,0))));assert.equal(frames.size,16);}
});
test('rocket cones and bodies never change during the exhaust loop',()=>{for(let direction=0;direction<16;direction++){const first=directionalFrame('rockets',direction,0);for(let t=0;t<2;t+=.017)assert.deepEqual(directionalFrame('rockets',direction,t),first);}assert.notDeepEqual(directionalFrame('flame',4,0),directionalFrame('flame',4,.07));});
test('pod plans are deterministic, cover the station, include single and clustered eggs and keep arrivals clear',()=>{
 for(let theme=0;theme<4;theme++){const world=makeWorld(2709+theme,theme,theme),pods=clingerPodPlan(world);assert.deepEqual(pods,clingerPodPlan(world));assert.ok(pods.length>=20&&pods.length<=52);assert.ok(pods.some(p=>p.corner));assert.ok(pods.some(p=>p.row===0)&&pods.some(p=>p.row>0));for(const p of pods){assert.ok(world.canMove(p.x,p.z,.4,p.y));assert.ok(Math.hypot(p.x-world.start.x,p.z-world.start.z)>14);assert.equal(p.remaining,POD_BROODS[p.row]);}}
});
test('pods spring only within ten metres and clear line of sight, launch the whole cluster once, persist empty husks',()=>{
 const world={los:()=>true},system=Object.create(ClingerPods.prototype);Object.assign(system,{world,pods:[{id:0,x:0,z:0,y:0,row:1,hp:44,state:'closed',age:0,remaining:3,spawned:0}]});const member={id:'a',player:{x:10.1,z:0,y:0,hp:100}},launched=[];
 const launch=(p,m,i)=>{launched.push(i);return true;};system.tick(.1,[member],launch);assert.equal(launched.length,0);member.player.x=9;world.los=()=>false;system.tick(.1,[member],launch);assert.equal(launched.length,0);world.los=()=>true;system.tick(.016,[member],launch);assert.deepEqual(launched,[0,1,2]);assert.equal(system.pods[0].state,'opening');member.player.x=40;system.tick(.4,[member],launch);assert.equal(system.pods[0].state,'empty');system.tick(10,[member],launch);assert.equal(launched.length,3);
 const snapshot=system.snapshot();system.pods[0].state='closed';system.restore(snapshot);assert.equal(system.pods[0].state,'empty');
});
test('a full actor budget retains a pod brood, and destroying a closed egg prevents its ambush',()=>{
 const system=Object.create(ClingerPods.prototype);Object.assign(system,{world:{los:()=>true},pods:[{id:1,x:0,y:0,z:0,row:0,state:'closed',age:0,hp:22,remaining:1,spawned:0}]});const member={player:{x:2,y:0,z:0,hp:100}};system.tick(.1,[member],()=>false);assert.equal(system.pods[0].remaining,1);system.hit(system.pods[0],22);system.tick(.1,[member],()=>{throw Error('Dead egg launched');});assert.equal(system.frame(system.pods[0]),6);system.tick(1,[],()=>{});assert.equal(system.frame(system.pods[0]),7);
});
test('an egg-launched facehugger traverses ten metres promptly and attaches, but cannot pass a wall',()=>{
 for(const wall of[false,true]){const a=makeActor('facehugger',0,0),m={id:'a',player:{x:9,y:0,z:0,hp:100}},world={floor:()=>0,canMove:x=>!wall||x<4,los:()=>true};Object.assign(a,{state:'attack',age:0,duration:.7,podLaunch:true,target:{x:9,y:1,z:0}});for(let i=0;i<24;i++)updateActor(a,.016,m.player,world,e=>{if(e.type==='latch')attachParasite(a,m);});assert.equal(!!m.player.grab,!wall);if(wall)assert.ok(a.x<4);}
});
test('wide tentacle catch volume strikes in under a fifth of a second but a fast sidestep can escape',()=>{
 assert.ok(TENTACLE_TELL+TENTACLE_STRIKE<.2);
 for(const dodge of[false,true]){const p={id:3,x:0,y:1,z:0,nx:1,reach:30,span:{x:30,y:1,z:0,length:30},maturity:1,hp:60,tentacleState:'idle',tentacleAge:0,age:0},m={id:'a',player:{x:9,y:0,z:1.2,hp:100}},system={patches:[p],world:{los:()=>true}};
 tickTentacles(system,[m],.016);assert.equal(p.tentacleState,'windup');tickTentacles(system,[m],TENTACLE_TELL+.001);if(dodge){m.player.z=4.8;m.player.tentaclePrevious=null;}tickTentacles(system,[m],TENTACLE_STRIKE+.001);assert.equal(!!m.player.grab,!dodge);}
});
test('normal movement is caught while a sprint can cross the locked strike before it arrives',()=>{
 for(const sprint of[false,true]){
  const p={id:3,x:0,y:1,z:0,nx:1,floor:0,reach:30,maturity:1,hp:60,tentacleState:'idle',tentacleAge:0,age:0},m={id:'a',player:{x:9,y:0,z:1.34,hp:100,yaw:0,vy:0,grounded:true}},world={los:()=>true,blocked:()=>false,at:()=>({y:0,ceiling:3}),floor:()=>0,canMove:()=>true},system={patches:[p],world};
  tickTentacles(system,[m],.01);assert.equal(p.tentacleState,'windup');
  for(let i=0;i<24&&!m.player.grab;i++){movePlayer(m.player,world,.01,{forward:1,sprint});tickTentacles(system,[m],.01);}
  assert.equal(!!m.player.grab,!sprint);
 }
});

test('cluster launches use separate clear positions while single eggs stay centered',()=>{const p={id:1,row:2,x:10,y:0,z:10},world={canMove:()=>true},points=Array.from({length:5},(_,i)=>clingerLaunchPoint(p,i,world));assert.equal(new Set(points.map(p=>p.x+':'+p.z)).size,5);assert.deepEqual(clingerLaunchPoint({...p,row:0},0,world),{x:10,z:10});assert.deepEqual(clingerLaunchPoint(p,0,{canMove:()=>false}),{x:10,z:10});});
