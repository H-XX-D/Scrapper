import test from'node:test';import assert from'node:assert/strict';import * as THREE from'../vendor/three.module.js';import{StationLights}from'../src/station-lights.js';
test('culled emissive fixtures beyond the fog still cast bounded light, while blocked sources are excluded',()=>{
 const scene=new THREE.Scene(),world={los:(_x,_z,x)=>x!==3},lights=new StationLights(scene,world),source={x:28,y:1,z:0,floor:0,kind:'screen',mesh:{visible:false},color:'#00ff00',strength:9};
 lights.rebuild({lightSources:[source,{...source,x:3,kind:'blocked'},{...source,x:36,kind:'too-far'}]},{lightSources:()=>[]},{lightSources:()=>[]});lights.update(.2,{x:0,y:0,z:0});
 const active=lights.snapshot().active;assert.equal(active.length,1);assert.equal(active[0].kind,'screen');assert.equal(active[0].reach,35);assert.equal(lights.pool.length,8);
 source.state=()=>({color:'#ff0000',strength:4});lights.update(.1,{x:0,y:0,z:0});assert.equal(lights.snapshot().active[0].color,'ff0000');assert.ok(lights.snapshot().active[0].intensity<4.1);
});
