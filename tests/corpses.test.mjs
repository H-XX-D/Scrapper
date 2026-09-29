import test from 'node:test';
import assert from 'node:assert/strict';
import {CorpseCleanup,corpseAnchor,groundCorpse} from '../src/corpses.js';
import {makeActor,hurtActor} from '../src/combat.js';
import {StationFog} from '../src/station-fog.js';
import * as THREE from '../vendor/three.module.js';

const world={at:(x,z,y)=>({room:'room-'+x+'-deck-'+y}),floor:(x,z,y)=>y};
const bodies=(rooms=10,count=9)=>Array.from({length:rooms*count},(_,id)=>({id,hp:0,x:Math.floor(id/count),z:0,groundY:0,y:2,age:id%count}));
test('crowded deaths retain at most 30 globally and five per room, preserving live actors',()=>{
 const cleanup=new CorpseCleanup(),live={id:1000,hp:30,x:0,z:0,y:0},removed=[];
 const result=cleanup.prune([...bodies(),live],world,[{hp:100,x:0,z:0,y:0}],0,a=>removed.push(a.id));
 assert.equal(result.length,31);assert.ok(result.includes(live));assert.equal(removed.length,60);
 for(let room=0;room<10;room++)assert.ok(result.filter(a=>a.hp===0&&a.x===room).length<=5);
 assert.equal(result.filter(a=>a.hp===0&&a.x===0).length,5);assert.ok(result.filter(a=>a.hp===0).every(a=>a.y===0));
 assert.equal(new Set(removed).size,removed.length);
});
test('newest bodies replace oldest; empty rooms keep two after 12 seconds, including co-op occupancy',()=>{
 const cleanup=new CorpseCleanup(),members=[{player:{hp:100,x:0,z:0,y:0}},{player:{hp:100,x:1,z:0,y:0}}];
 let result=cleanup.prune(bodies(3),world,members,0);
 assert.deepEqual(result.filter(a=>a.x===0).map(a=>a.age),[0,1,2,3,4]);
 result=cleanup.prune(result,world,members,12.1);assert.equal(result.filter(a=>a.x===2).length,2);assert.equal(result.filter(a=>a.x===1).length,5);
 members.pop();result=cleanup.prune(result,world,members,0);result=cleanup.prune(result,world,members,12.1);
 assert.equal(result.filter(a=>a.x===1).length,2);assert.equal(result.filter(a=>a.x===0).length,5);
});
test('returning crew resets the empty-room timer and layered rooms are independent',()=>{
 const cleanup=new CorpseCleanup(),lower=bodies(1,5),upper=bodies(1,5).map(a=>({...a,id:a.id+10,groundY:6}));
 let result=cleanup.prune([...lower,...upper],world,[{hp:100,x:0,z:0,y:6}],0);
 result=cleanup.prune(result,world,[{hp:100,x:0,z:0,y:0}],10);
 result=cleanup.prune(result,world,[{hp:100,x:0,z:0,y:6}],10);
 assert.equal(result.length,10);
 result=cleanup.prune(result,world,[{hp:100,x:0,z:0,y:6}],12.1);
 assert.equal(result.filter(a=>a.groundY===0).length,2);assert.equal(result.filter(a=>a.groundY===6).length,5);
});
test('flying, attached, and leaping enemies land on death, follow lifts, and never linger over voids',()=>{
 for(const type of ['bat','facehugger','gnats','burrower']){const a=makeActor(type,0,0);a.y=1.7;a.groundY=6;a.attachedTo='peer';hurtActor(a,9999,'blast');assert.equal(a.y,0);groundCorpse(a,{floor:(x,z,y)=>y+.2});assert.equal(a.groundY,6.2);assert.equal(a.attachedTo,null);}
 assert.equal(new CorpseCleanup().prune(bodies(1),{...world,floor:()=>null},[],0).length,0);
});
test('sprite foot anchor follows opaque pixels rather than transparent padding, and is cached',()=>{
 let reads=0;const width=16,height=16,data=new Uint8ClampedArray(width*height*4);data[(11*width+7)*4+3]=255;data[(15*width+7)*4+3]=20;
 const canvas={width,height,getContext:()=>({getImageData:()=>{reads++;return{data};}})};
 assert.equal(corpseAnchor(canvas),4/16);assert.equal(corpseAnchor(canvas),4/16);assert.equal(reads,1);
});
test('station volume patches instanced surfaces and sprites once, sharing camera/time without extra draws',()=>{
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),fog=new StationFog(scene,camera,'#10252a');
 const materials=[new THREE.MeshLambertMaterial(),new THREE.SpriteMaterial()];
 for(const material of materials){fog.attach(material);const version=material.version,shader={uniforms:{},vertexShader:THREE.ShaderLib[material.isSpriteMaterial?'sprite':'lambert'].vertexShader,fragmentShader:THREE.ShaderLib[material.isSpriteMaterial?'sprite':'lambert'].fragmentShader};material.onBeforeCompile(shader);fog.attach(material);assert.equal(material.version,version);assert.equal(shader.uniforms.stationCameraWorld.value,camera.matrixWorld);assert.equal(shader.uniforms.stationFogTime,fog.time);assert.match(shader.vertexShader,/stationCameraWorld \* mvPosition/);assert.match(shader.fragmentShader,/fogStep<4/);assert.doesNotMatch(shader.fragmentShader,/#include <fog_fragment>/);}
 fog.update(.2);assert.equal(fog.time.value,.2);assert.equal(scene.children.length,0);
});
