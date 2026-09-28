import test from 'node:test';import assert from 'node:assert/strict';
import{renderSound,spatialMix}from'../src/audio.js';import{WEAPONS,ACTORS}from'../src/catalog.js';import{makeWorld}from'../src/world.js';
test('each weapon has a distinct, finite sample with headroom and a smooth tail',()=>{
 const sounds=WEAPONS.map(w=>renderSound(w.id,123));
 for(const [i,s]of sounds.entries()){let peak=0,power=0;for(const v of s){assert.ok(Number.isFinite(v));peak=Math.max(peak,Math.abs(v));power+=v*v;}assert.ok(peak>.16&&peak<.8,WEAPONS[i].id);assert.ok(Math.sqrt(power/s.length)>.025,WEAPONS[i].id);assert.ok(Math.abs(s.at(-1))<.006,WEAPONS[i].id);}
 for(let a=0;a<sounds.length;a++)for(let b=a+1;b<sounds.length;b++){let aa=0,bb=0,ab=0;for(let i=0;i<Math.min(sounds[a].length,sounds[b].length);i++){aa+=sounds[a][i]**2;bb+=sounds[b][i]**2;ab+=sounds[a][i]*sounds[b][i];}assert.ok(Math.abs(ab/Math.sqrt(aa*bb))<.92,WEAPONS[a].id+' / '+WEAPONS[b].id);}
});
test('world sounds get quieter with distance and pan with player orientation',()=>{const p={x:0,y:0,z:0,yaw:0};assert.ok(spatialMix({x:30,z:0},p).gain<spatialMix({x:3,z:0},p).gain);assert.ok(spatialMix({x:10,z:0},p).pan>0);assert.ok(spatialMix({x:10,z:0},{...p,yaw:Math.PI}).pan<0);});
test('all seventeen original enemy types return across the four level families',()=>{const originals=['beetle','crawler','drone','tank','splitter','lancer','spitter','bomber','warden','leech','shardling','jelly','scorpion','priest','bat','worm','spider'],spawned=new Set();for(let t=0;t<4;t++)for(const e of makeWorld(2709,t).encounters)spawned.add(e.type);for(const id of originals){assert.ok(ACTORS[id],id);assert.ok(spawned.has(id),id);}});
