import test from'node:test';import assert from'node:assert/strict';
import * as THREE from'../vendor/three.module.js';
import{Infestation}from'../src/infestation.js';import{makeWorld}from'../src/world.js';import{CombatLights}from'../src/lighting.js';
test('wall colonies are deterministic, attach to walls and leave mission terminals clear',()=>{
 for(let chapter=0;chapter<12;chapter++){const w=makeWorld(2709,chapter%4,chapter),a=new Infestation(w),b=new Infestation(w);assert.deepEqual(a.snapshot(),b.snapshot());assert.ok(a.patches.length>=35);assert.equal(new Set(a.patches.map(p=>p.type)).size,4);for(const p of a.patches){assert.ok(w.at(p.x+p.nx*.9,p.z+p.nz*.9,p.floor));if(!p.surface)assert.equal(w.at(p.x-p.nx*.4,p.z-p.nz*.4,p.floor),undefined);else{const c=w.at(p.x,p.z,p.floor);assert.ok(Math.abs(p.y-(p.surface==='floor'?c.y+.05:c.ceiling-.05))<.01);}assert.ok(Math.hypot(p.x-w.control.x,p.z-w.control.z,p.floor-w.control.y)>=3);}}
});
test('unattended growth matures and spreads within a bounded population; dead patches do not regrow',()=>{
 const a=new Infestation(makeWorld(2709,0,0)),before=a.patches.length,dead=a.patches[0],stoppedMaturity=dead.maturity;a.hit(dead.id,1000);assert.ok(dead.dead);assert.equal(a.frame(dead),7);for(let i=0;i<120;i++)a.tick(1);assert.ok(a.patches.length>before);assert.ok(a.patches.length<=a.limit);assert.equal(a.patches.filter(p=>p.anchor===dead.anchor).length,1);assert.equal(dead.maturity,stoppedMaturity);assert.equal(a.hit(dead.id,20),null);
});
test('flame clears infestation faster; saves restore spreading timers and destroyed husks exactly',()=>{
 const w=makeWorld(2709,1,1),a=new Infestation(w),p=a.patches[0],hp=p.hp;a.hit(p.id,10,true);assert.equal(p.hp,hp-18);assert.ok(p.burn>0);a.tick(9);a.hit(a.patches[1].id,1000);const state=JSON.parse(JSON.stringify(a.snapshot())),b=new Infestation(w);b.restore(state);assert.deepEqual(b.snapshot(),state);a.tick(2);b.tick(2);assert.deepEqual(a.snapshot(),b.snapshot());
});
test('FFA has no spreading colonies and sustained combat lights track flame and area effects',()=>{
 assert.equal(new Infestation(makeWorld(2709,0,0),{enabled:false}).patches.length,0);
 const light=new CombatLights(new THREE.Scene()),area={x:3,y:1,z:0,color:'#b4ec42',strength:13,radius:12,kind:'area'},flame={x:0,y:1,z:2,color:'#ff9e38',strength:11,radius:10,kind:'flame'};light.update(.5,[],[area,flame]);assert.ok(light.snapshot().some(l=>l.kind==='area'&&l.intensity===13));assert.ok(light.snapshot().some(l=>l.kind==='flame'&&l.intensity===11));light.update(4,[],[area]);assert.equal(light.snapshot().length,1);light.update(.1);assert.equal(light.snapshot().length,0);
});
