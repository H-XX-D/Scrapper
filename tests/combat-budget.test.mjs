import test from 'node:test';import assert from 'node:assert/strict';
import {CombatBudget,MONSTER_LIMIT,COMBAT_RADIUS,distance} from '../src/combat-budget.js';
import {makeActor,updateActor} from '../src/combat.js';
const member=(id,x=0)=>({id,player:{x,y:0,z:0,hp:100}});
const crowd=(count,x=0)=>Array.from({length:count},(_,i)=>({...makeActor('beetle',x+(i%6)*.3,(i%7)*.2),groundY:0}));
test('one room has at most thirty active monsters even with four players together',()=>{
 const b=new CombatBudget(),actors=crowd(120),crew=[member('a'),member('b',2),member('c',3),member('d',4)];
 const stats=b.update(actors,crew);assert.equal(stats.active,MONSTER_LIMIT);assert.ok(stats.perPlayer.every(n=>n===30));assert.equal(b.canSpawn({x:1,y:0,z:1},actors,crew),false);
 actors.find(a=>!a.dormant).hp=0;assert.equal(b.canSpawn({x:1,y:0,z:1},actors,crew),true);
});
test('separated teammates keep independent budgets; overlapping groups never add their caps together',()=>{
 const b=new CombatBudget(),actors=[...crowd(65),...crowd(65,100)],crew=[member('a'),member('b',100)];
 assert.deepEqual(b.update(actors,crew).perPlayer,[30,30]);assert.equal(b.stats.active,60);
 crew[1].player.x=20;for(let i=0;i<80;i++){b.update(actors,crew);for(const a of actors)if(!a.dormant)a.x+=.3;}
 b.update(actors,crew);for(const m of crew)assert.ok(actors.filter(a=>!a.dormant&&distance({x:a.x,y:a.groundY,z:a.z},m.player)<=COMBAT_RADIUS).length<=30);
});
test('reserve monsters cannot attack, and captured parasites and bosses retain budget priority',()=>{
 const b=new CombatBudget(),actors=crowd(40),boss={...makeActor('matriarch',5,0),groundY:0},attached={...makeActor('facehugger',0,0),groundY:0,attachedTo:'a'};actors.push(boss,attached);
 b.update(actors,[member('a')]);assert.equal(boss.dormant,false);assert.equal(attached.dormant,false);
 const reserve=actors.find(a=>a.dormant);reserve.state='tell';reserve.age=10;reserve.duration=.1;
 updateActor(reserve,.1,{x:0,y:0,z:0},{floor:()=>0},()=>{throw Error('Invisible reserve attacked');});assert.equal(reserve.age,10);
});

test('retiring an attack cancels its windup instead of firing at a stale target on reentry',()=>{
 const budget=new CombatBudget(),a={...makeActor('beetle',0,0),groundY:0,state:'tell',age:.5,target:{x:0,y:0,z:0}};budget.update([a],[member('a',100)]);assert.equal(a.dormant,true);assert.equal(a.state,'idle');assert.equal(a.target,null);budget.update([a],[member('a')]);assert.equal(a.dormant,false);assert.ok(a.cooldown>=1);
});
