import test from'node:test';import assert from'node:assert/strict';
import{CompassContacts,compassProjection,compassTargets,COMPASS_LIMIT}from'../src/compass.js';
import{makeWorld}from'../src/world.js';import{RouteGuide}from'../src/navigation.js';
import{CHAPTERS}from'../src/campaign.js';
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
test('compass bearings put left, ahead, right and rear contacts on the correct side',()=>{
 assert.equal(compassProjection(0).x,50);assert.equal(compassProjection(Math.PI/2).x,2);assert.equal(compassProjection(-Math.PI/2).x,98);
 assert.equal(compassProjection(Math.PI*.8).edge,'left');assert.equal(compassProjection(-Math.PI*.8).edge,'right');
});
test('compass filters dead enemies, taken loot, sealed cases, allies and undiscovered secrets',()=>{
 const secret={id:'cache',x:20,z:0,y:0,room:'secret-cache',found:false};
 const world={at:x=>({room:x>=20?'secret-cache':'hall'}),secrets:[secret],accessCard:{taken:false,x:2,z:3},control:{x:8,z:0},purge:{x:9,z:0},puzzle:{solved:true},switches:[]};
 const args={world,tasks:{solved:true,nodes:[]},mission:{record:false,power:null,choices:[]},primary:{x:8,z:0},cases:[{x:3,z:0,open:false},{x:4,z:0,open:true},{x:5,z:0,locked:true},{x:20,z:0}],pickups:[{x:6,z:0,kind:'ammo',age:1},{x:7,z:0,kind:'gun',age:1,taken:true},{x:10,z:0,kind:'health',age:0,delay:1}],actors:[{id:1,type:'beetle',x:2,z:0,hp:20},{id:2,type:'spitter',x:2,z:0,hp:0},{id:3,type:'beetle',x:2,z:0,hp:20}],crew:[{id:'friend',player:{x:3,z:3,hp:100}}],mode:'coop'};
 let contacts=compassTargets(args);assert.equal(contacts.filter(c=>c.kind==='enemy').length,2);assert.deepEqual(contacts.filter(c=>c.kind==='supply').map(c=>c.id),['case:0','pickup:0']);assert.equal(contacts.filter(c=>c.x===8).length,1);
 secret.found=true;args.mission.record=true;args.mission.power='armory';args.mission.choices=[{id:'purge'}];args.primary=null;world.accessCard.taken=true;args.mode='pvpve';contacts=compassTargets(args);
 assert.ok(contacts.some(c=>c.id==='secret:cache'));assert.ok(contacts.some(c=>c.id==='case:2'));assert.ok(contacts.some(c=>c.id==='rival:friend'));assert.ok(!contacts.some(c=>c.kind==='objective'));
});
test('compass keeps current objective and the nearest nineteen other contacts, then replaces removed enemies',()=>{
 const w=makeWorld(2709,0,0),p={...w.start,yaw:0},tracker=new CompassContacts(w),g=new RouteGuide(w);g.update(p,w.control,0);
 const targets=Array.from({length:60},(_,i)=>({id:'enemy:'+i,kind:'enemy',x:p.x+i+1,z:p.z-2,y:p.y}));targets.push({id:'main',kind:'objective',primary:true,...w.control});
 const contacts=tracker.update(p,targets,0,g);assert.equal(contacts.length,COMPASS_LIMIT);assert.equal(contacts[0].id,'main');assert.deepEqual(contacts.slice(1).map(c=>c.id),Array.from({length:19},(_,i)=>'enemy:'+i));
 const next=tracker.update(p,targets.filter(t=>t.id!=='enemy:0'),0,g);assert.ok(!next.some(c=>c.id==='enemy:0'));assert.ok(next.some(c=>c.id==='enemy:19'));
});
test('shared compass route trees match individual paths on all twelve layered chapters and respect gates',()=>{
 for(let chapter=0;chapter<12;chapter++){
  const w=makeWorld(2709+chapter*911,CHAPTERS[chapter].theme,chapter),p=w.start;
  for(const open of[false,true]){for(const g of w.gates)g.open=open;const pathTo=w.routesFrom(p.x,p.z,{startY:p.y,includeLifts:true});
   for(const goal of[w.control,w.exit,w.overpass.goal,...w.cases.slice(0,2)])assert.deepEqual(pathTo(goal.x,goal.z,goal.y),w.waypoint(p.x,p.z,goal.x,goal.z,{startY:p.y,endY:goal.y,includeLifts:true,fullPath:true}));
  }
 }
});
test('diamonds use the walkable waypoint, rotate immediately, and replan on movement or gate changes',()=>{
 const w=makeWorld(2709,0,0),p={...w.start,yaw:0},tracker=new CompassContacts(w),goal=w.overpass.goal;
 const targets=[{id:'supply:upper',kind:'supply',...goal},{id:'archive',kind:'objective',...w.control}];
 let contacts=tracker.update(p,targets,0);assert.equal(contacts.length,2);
 for(const c of contacts){const g=new RouteGuide(w);g.update(p,targets.find(t=>t.id===c.id),0);assert.deepEqual(c.next,g.next);assert.equal(c.action,g.action);assert.ok(c.routeDistance>0);}
 const revision=tracker.revision,old=contacts.map(c=>c.relative);p.yaw=.6;contacts=tracker.update(p,targets,0);assert.equal(tracker.revision,revision);contacts.forEach((c,i)=>assert.ok(Math.abs(wrap(c.relative-old[i]+.6))<1e-9));
 w.gates[0].open=!w.gates[0].open;tracker.update(p,targets,0);assert.equal(tracker.revision,revision+1);
 const next=contacts[0].next;p.x=next.x;p.z=next.z;p.y=next.y;tracker.update(p,targets,0);assert.ok(tracker.revision>revision+1);
});
