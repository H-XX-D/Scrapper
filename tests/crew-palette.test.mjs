import test from 'node:test';
import assert from 'node:assert/strict';
import {availablePilot,crewSpawnPoints,crewFrame,advanceCrewWalk} from '../src/crew.js';
import {NetRoom,PROTOCOL} from '../src/network.js';
import {makeWorld} from '../src/world.js';
import {SPECS} from '../src/atlas.js';
import {PILOTS,WEAPONS} from '../src/catalog.js';
import {recolorSuit} from '../src/suit-palette.js';
test('host assigns unique salvagers even when every joiner requests Rook; leaving frees that slot',()=>{
 const room=new NetRoom(()=>{});room.role='host';room.members=[{id:'host',pilot:'rook'}];const messages=[];
 for(let n=1;n<=4;n++){const conn={peer:'p'+n,open:true,send:m=>messages.push(m)};room.connections.set(conn.peer,conn);room.receive(conn,{v:PROTOCOL,type:'hello',pilot:'rook'});}
 assert.deepEqual(room.members.map(m=>m.pilot),['rook','echo','flint','eos']);assert.equal(messages.at(-1).type,'reject');assert.equal(availablePilot('bad',room.members),null);
 room.members=room.members.filter(m=>m.pilot!=='echo');assert.equal(availablePilot('rook',room.members),'echo');assert.equal(availablePilot('eos',[]),'eos');
});
test('four co-op deployments have separated visible positions on real floor in every chapter family',()=>{
 for(let theme=0;theme<4;theme++)for(const seed of [1,23,2709,89101]){const w=makeWorld(seed,theme),p=crewSpawnPoints(w,4);assert.equal(p.length,4);for(let i=0;i<p.length;i++){assert.ok(w.canMove(p[i].x,p[i].z,.38,p[i].y));assert.equal(w.floor(p[i].x,p[i].z,p[i].y),p[i].y);assert.ok(w.los(w.start.x,w.start.z,p[i].x,p[i].z,w.start.y+1.4,p[i].y+1.4));for(let j=0;j<i;j++)assert.ok(Math.hypot(p[i].x-p[j].x,p[i].z-p[j].z)>1.5);}}
});
test('walking advances on the local host and selects valid directional movement frames for all crew sheets',()=>{
 const m={walkAge:0};advanceCrewWalk(m,{moving:true},.25);assert.equal(m.walkAge,.25);advanceCrewWalk(m,{moving:false},1);assert.equal(m.walkAge,.25);assert.equal(m.moving,false);
 for(const pilot of Object.keys(PILOTS))for(const w of WEAPONS){const spec=SPECS['crew-'+pilot+'-'+w.id],steps=new Set();for(let f=0;f<spec.walkFrames*16;f++){const frame=crewFrame(f*Math.PI/8,{x:0,z:-10},{x:0,z:0},f/9,true,spec);assert.ok(spec.rects[frame.row]?.[frame.col]);steps.add(frame.step);}assert.equal(steps.size,spec.walkFrames);}
});
function pixels(points){const w=384,h=341,data=new Uint8ClampedArray(w*h*4);for(const[x,y,color]of points)data.set(color,(y*w+x)*4);return{width:w,height:h,data};}
const orange=[242,114,8,255];
test('disconnected fingertips and sleeve all change color while black bands, cyan lights and alpha survive',()=>{
 const points=[[5,310,orange],[110,180,orange],[190,265,orange],[190,280,[28,30,32,255]],[192,100,[0,230,250,255]],[5,10,[255,0,255,0]]];
 for(const hue of [276,166,188]){const image=pixels(points),before=image.data.slice();recolorSuit(image,hue,'reload-bolt');for(let n=0;n<3;n++){const[x,y]=points[n],i=(y*384+x)*4;assert.notDeepEqual([...image.data.slice(i,i+3)],[...before.slice(i,i+3)]);}for(const[x,y]of points.slice(3)){const i=(y*384+x)*4;assert.deepEqual(image.data.slice(i,i+4),before.slice(i,i+4));}for(let i=3;i<before.length;i+=4)assert.equal(image.data[i],before[i]);}
});
test('beam crystal, flame tank and rocket noses retain their orange while hands change',()=>{
 for(const[id,hand,weapon]of [['beam',[99,216],[194,174]],['flame',[120,180],[192,250]],['rockets',[109,230],[194,126]]]){const image=pixels([[...hand,orange],[...weapon,orange]]);recolorSuit(image,276,'reload-'+id,0);assert.notEqual(image.data[(hand[1]*384+hand[0])*4+2],orange[2]);assert.deepEqual([...image.data.slice((weapon[1]*384+weapon[0])*4,(weapon[1]*384+weapon[0])*4+4)],orange);}
});
test('all four original wipe poses recolor isolated fingers as well as the sleeve',()=>{
 for(let f=0;f<4;f++){const image=pixels([[90,40,orange],[120,75,orange],[180,290,orange]]);recolorSuit(image,188,'wipe',f);for(const[x,y]of [[90,40],[120,75],[180,290]])assert.ok(image.data[(y*384+x)*4+2]>180);}
});
