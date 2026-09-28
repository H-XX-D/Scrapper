import test from'node:test';
import assert from'node:assert/strict';
import{ControllerInput,PAD,radialStick,lookDelta,controllerSettings,MenuRepeat}from'../src/controller.js';
import{movePlayer}from'../src/traversal.js';
import{sanitizeInput}from'../src/network.js';
const makePad=(index=0)=>({index,id:'test-pad-'+index,mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))});
const press=(pad,key,value=true)=>{pad.buttons[PAD[key]]={pressed:value,value:value?1:0};};
test('radial dead zone removes drift and preserves proportional and diagonal input',()=>{
 assert.deepEqual(radialStick(.09,-.12),{x:0,y:0});assert.ok(Math.abs(radialStick(0,-.59).y+.5)<1e-9);
 assert.ok(Math.abs(Math.hypot(...Object.values(radialStick(1,1)))-1)<1e-9);
 assert.deepEqual(radialStick(NaN,Infinity),{x:0,y:0});assert.equal(radialStick(2,0).x,1);
});
test('look is frame-rate independent, supports precision aim and invert, and sanitizes settings',()=>{
 const settings=controllerSettings(),stick={x:.4,y:-.8};
 const a=lookDelta(stick,1/30,settings),b=lookDelta(stick,1/120,settings);assert.equal(a.yaw,b.yaw*4);assert.equal(a.pitch,b.pitch*4);
 assert.equal(lookDelta(stick,1/30,{...settings,invertY:true}).pitch,-a.pitch);
 assert.ok(Math.abs(lookDelta(stick,1/30,settings,true).yaw-a.yaw*.38)<1e-12);
 assert.deepEqual(controllerSettings({sensitivity:9,deadzone:-9,invertY:'yes'}),{sensitivity:2.5,deadzone:.08,invertY:false});
 assert.deepEqual(controllerSettings(null),settings);
});
test('standard pad polling tolerates null slots and replacement objects, with one action per press',()=>{
 const input=new ControllerInput(),pad=makePad(2);input.poll([null,null,pad],.016);press(pad,'reload');
 assert.equal(input.poll([null,null,structuredClone(pad)],.016).pressed[PAD.reload],true);
 assert.equal(input.poll([null,null,structuredClone(pad)],.016).pressed[PAD.reload],false);
 press(pad,'reload',false);input.poll([pad],.016);press(pad,'reload');assert.equal(input.poll([pad],.016).pressed[PAD.reload],true);
 const other=makePad(0);press(other,'fire');assert.equal(input.poll([other,pad],.016).held[PAD.fire],false,'retain the active pad');
});
test('connection, pause, background focus and replacement require neutral before any fire',()=>{
 const input=new ControllerInput(),pad=makePad();press(pad,'fire');assert.ok(!input.poll([pad],.016).held[PAD.fire]);
 press(pad,'fire',false);input.poll([pad],.016);press(pad,'fire');assert.ok(input.poll([pad],.016).held[PAD.fire]);
 input.suspend();assert.ok(!input.poll([pad],.016).held[PAD.fire]);
 press(pad,'fire',false);input.poll([pad],.016);press(pad,'fire');assert.ok(!input.poll([pad],.016,false).held[PAD.fire]);assert.ok(!input.poll([pad],.016,true).held[PAD.fire]);
 press(pad,'fire',false);input.poll([pad],.016);pad.axes[1]=-1;assert.equal(input.poll([pad],.016).move.y,-1);
 const disconnected=input.poll([], .016);assert.ok(disconnected.lost);assert.equal(disconnected.move.y,0);assert.ok(!disconnected.held[PAD.fire]);assert.ok(!input.poll([], .016).lost);
 const replacement=makePad();replacement.id='replacement';press(replacement,'fire');assert.ok(!input.poll([replacement],.016).held[PAD.fire]);
 assert.ok(!new ControllerInput().poll([{...pad,mapping:''}],.016).connected);
});
test('jump lasts long enough for network transmission but a held button does not auto-jump',()=>{
 const input=new ControllerInput(),pad=makePad();input.poll([pad],.016);press(pad,'jump');assert.ok(input.poll([pad],.016).jump);
 for(let i=0;i<4;i++)assert.ok(input.poll([pad],.016).jump);
 for(let i=0;i<60;i++)input.poll([pad],.016);assert.equal(input.state.jump,false);assert.equal(input.state.pressed[PAD.jump],false);
 press(pad,'jump',false);input.poll([pad],.016);press(pad,'jump');assert.ok(input.poll([pad],.016).jump);
});
test('menu navigation repeats predictably without repeating button actions',()=>{
 const repeat=new MenuRepeat();assert.equal(repeat.tick('down',.016),'down');assert.equal(repeat.tick('down',.2),'');assert.equal(repeat.tick('down',.15),'down');assert.equal(repeat.tick('up',.016),'up');assert.equal(repeat.tick('',.016),'');assert.equal(repeat.tick('up',.016),'up');
});
test('solo and network movement retain half-stick speed without diagonal acceleration',()=>{
 const world={lifts:[],at:()=>({ceiling:4}),floor:()=>0,canMove:()=>true};
 const travel=input=>{const player={x:0,y:0,z:0,yaw:0,grounded:true,vy:0,safe:{x:0,y:0,z:0}};for(let i=0;i<60;i++)movePlayer(player,world,1/60,input);return Math.hypot(player.x,player.z);};
 const full=travel({forward:1}),half=travel(sanitizeInput({seq:0,forward:.5,strafe:0})),diagonal=travel({forward:1,strafe:1});
 assert.ok(Math.abs(full-7.4)<1e-8);assert.ok(Math.abs(half-full/2)<1e-8);assert.ok(Math.abs(diagonal-full)<1e-8);assert.ok(travel({forward:.5,sprint:true})>half);
});
