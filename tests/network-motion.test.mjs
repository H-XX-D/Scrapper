import test from 'node:test';import assert from 'node:assert/strict';
import {MovementHistory,smoothPose} from '../src/network-motion.js';
const world={at:()=>({y:0,ceiling:4}),floor:()=>0,canMove:()=>true,lifts:[]};
const player=()=>({x:0,y:0,z:0,yaw:0,pitch:0,hp:100,vy:0,grounded:true,safe:{x:0,y:0,z:0}});
test('guest movement replays only motion newer than the input consumed by the host',()=>{
 const h=new MovementHistory();h.record(.02,{forward:1},0);h.mark(1);for(let i=0;i<5;i++)h.record(.02,{forward:1},0);
 const authoritative=player(),predicted=h.reconcile(authoritative,1,.04,world);assert.ok(Math.abs(predicted.z+7.4*.06)<1e-9);assert.equal(authoritative.z,0);
});
test('capture and death suppress replay; expired histories and mission changes stay bounded',()=>{
 const h=new MovementHistory();for(let i=0;i<500;i++){h.record(.02,{forward:1},0);h.mark(i);}
 assert.ok(h.steps.length<=77&&h.sent.size<=64);for(const field of['grab','down','dead']){const p={...player(),[field]:true};assert.deepEqual(h.reconcile(p,499,0,world),p);}
 h.reset();assert.equal(h.steps.length,0);assert.equal(h.sent.size,0);assert.deepEqual(h.reconcile(player(),499,0,world),player());
});
test('replayed movement still collides with architecture, and sprite interpolation snaps teleports',()=>{
 const h=new MovementHistory();h.mark(1);for(let i=0;i<10;i++)h.record(.02,{forward:1},0);
 const p=h.reconcile(player(),1,0,{...world,canMove:(x,z)=>z>-.4});assert.ok(p.z>=-.4);
 const old={x:0,y:0,z:0},next={x:1,y:0,z:0};const display=smoothPose(old,next,.02);assert.ok(display.x>0&&display.x<1);assert.deepEqual(smoothPose(old,{x:100,y:4,z:0},.02),{x:100,y:4,z:0});
});
