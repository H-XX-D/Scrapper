import test from'node:test';import assert from'node:assert/strict';
import{makeWorld}from'../src/world.js';import{CHAPTERS}from'../src/campaign.js';import{MissionTasks}from'../src/mission-tasks.js';import{PuzzleSystem,NEW_PUZZLES,CHAPTER_PUZZLES}from'../src/puzzle-systems.js';import{CHAPTER_LAYOUTS}from'../src/chapter-layouts.js';import{RouteGuide}from'../src/navigation.js';import{movePlayer}from'../src/traversal.js';
const world=()=>makeWorld(2709,0,0),use=(t,a)=>t.use(t.kind+'-'+a),hold=(t,a,seconds)=>{const n=t.nodes.find(n=>n.action===a);for(let k=0;k<seconds*60;k++)t.tick(1/60,[{...n,hp:100,revive:true}]);};
function solveSliding(board){const target='123456780',queue=[[board.join(''),[]]],seen=new Set([board.join('')]);for(let i=0;i<queue.length;i++){const[b,path]=queue[i];if(b===target)return path;const zero=b.indexOf('0');for(let j=0;j<9;j++){if(Math.abs(zero%3-j%3)+Math.abs(Math.floor(zero/3)-Math.floor(j/3))!==1)continue;const next=b.split('');[next[j],next[zero]]=[next[zero],next[j]];const key=next.join('');if(!seen.has(key)){seen.add(key);queue.push([key,[...path,j]]);}}}throw Error('unsolvable board');}
test('twelve additional mechanics and the four original systems all appear in chapter-specific plans',()=>{assert.equal(new Set(CHAPTER_PUZZLES.flat()).size,16);assert.equal(new Set(NEW_PUZZLES).size,12);for(let i=0;i<12;i++){const t=new MissionTasks(makeWorld(2709,CHAPTERS[i].theme,i),i);assert.equal(t.kind,NEW_PUZZLES[i]);assert.equal(t.powered,true);assert.ok(t.nodes.every(n=>n.kind!=='coupler'));}});
test('neighbor fuse toggles, legal sliding cargo, oscillator dials and load transfers solve by different rules',()=>{
 const w=world(),c=new PuzzleSystem(w,'circuit');for(const i of[0,2,3])use(c,'fuse-'+i);assert.ok(c.solved);
 const cargo=new PuzzleSystem(w,'cargo');const before=cargo.snapshot();assert.equal(use(cargo,'slide-0').accepted,false);assert.deepEqual(cargo.snapshot(),before);for(const i of solveSliding(cargo.state.board))use(cargo,'slide-'+i);assert.ok(cargo.solved);
 const f=new PuzzleSystem(w,'frequency');for(let i=0;i<3;i++)for(let n=0;n<f.state.target[i];n++)use(f,'dial-'+i);assert.ok(f.solved);
 const load=new PuzzleSystem(w,'loadshare');for(let i=0;i<4;i++)use(load,'transfer-0');for(let i=0;i<3;i++)use(load,'transfer-1');assert.deepEqual(load.state.loads,[2,1,3]);assert.ok(load.solved);
});
test('airlock interlocks reject premature opening; heat control needs sustained stability',()=>{
 const w=world(),a=new PuzzleSystem(w,'airlock');assert.ok(use(a,'outer').wrong);assert.equal(a.state.step,0);use(a,'inner');hold(a,'filter',3);assert.equal(a.state.step,1);hold(a,'drain',3.5);assert.equal(a.state.step,2);hold(a,'filter',2.1);assert.equal(a.state.step,3);use(a,'outer');assert.ok(a.solved);
 const t=new PuzzleSystem(w,'thermal');hold(t,'cool',4);assert.ok(t.state.temperature>=38&&t.state.temperature<=44);for(let i=0;i<180;i++)t.tick(1/60);assert.ok(t.solved);
});
test('cargo crane must collect and lower both containers over their matching pads',()=>{
 const t=new PuzzleSystem(world(),'crane');use(t,'hook');assert.equal(t.state.carried,null);
 for(const a of['north','west','hook','south','south','hook','north','north','east','east','hook','south','south','hook'])use(t,a);assert.ok(t.solved);assert.deepEqual(t.state.delivered,[0,1]);
});
test('signal playback blocks input, wrong notes reset, and the sensor grid reacts to walking',()=>{
 const w=world(),m=new PuzzleSystem(w,'memory');use(m,'play');assert.equal(use(m,'note-0').accepted,false);m.tick(5);use(m,'note-'+((m.state.sequence[0]+1)%4));assert.equal(m.state.entered,0);for(const n of m.state.sequence)use(m,'note-'+n);assert.ok(m.solved);
 const p=new PuzzleSystem(w,'plates'),step=i=>p.tick(.1,[{...p.nodes[i],hp:100}]);step(0);step(2);assert.equal(p.state.progress,0);for(const i of p.state.order){p.tick(.1,[]);step(i);}assert.ok(p.solved);
});
test('samples enforce one carried specimen and species matching; filters isolate three colors',()=>{
 const w=world(),q=new PuzzleSystem(w,'quarantine');use(q,'sample-0');assert.equal(use(q,'sample-1').accepted,false);assert.ok(use(q,'chamber-1').wrong);for(let i=0;i<3;i++){if(i)use(q,'sample-'+i);use(q,'chamber-'+i);}assert.ok(q.solved);
 const s=new PuzzleSystem(w,'spectrum');assert.ok(use(s,'transmit').wrong);for(const bits of[6,5,7]){for(let i=0;i<3;i++)if(bits&(1<<i))use(s,'filter-'+i);use(s,'transmit');}assert.ok(s.solved);
});
test('dispatch shutdown expires and restarts; puzzle state restores exactly including timers and carried cargo',()=>{
 const w=world(),d=new PuzzleSystem(w,'dispatch');assert.equal(use(d,'breaker-1').accepted,false);use(d,'breaker-0');d.tick(d.state.limit+1);assert.equal(d.state.step,0);for(let i=0;i<3;i++)use(d,'breaker-'+i);assert.ok(d.solved);
 for(const kind of NEW_PUZZLES){const t=new PuzzleSystem(w,kind);t.use(t.nodes[0].id);t.tick(.4);const copy=new PuzzleSystem(w,kind);copy.restore(JSON.parse(JSON.stringify(t.snapshot())));assert.deepEqual(copy.snapshot(),t.snapshot(),kind);}
});
test('chapter topology, silhouettes and floor-connected objectives vary across twelve profiles',()=>{
 assert.equal(new Set(CHAPTER_LAYOUTS.map(p=>p.links.map(l=>l.join(':')).sort().join('|'))).size,12);
 const signatures=new Set();for(let chapter=0;chapter<12;chapter++)for(let seed=1;seed<=10;seed++){const w=makeWorld(seed,CHAPTERS[chapter].theme,chapter),t=new MissionTasks(w,chapter);assert.equal(w.layoutVersion,3);assert.equal(w.waypoint(w.start.x,w.start.z,w.exit.x,w.exit.z,{startY:w.start.y,endY:w.exit.y,fullPath:true}),null,'sealed guardian gate must not have a procedural bypass');assert.ok(w.cells.size>2500);assert.ok(w.rooms.every(r=>r.height<=4.6));assert.ok(w.layerCount>0);assert.equal(w.lifts.length,2);if(seed===1)signatures.add(w.rooms.map(r=>[r.cx,r.cz,r.w,r.d,r.y].join(',')).join('|'));for(const n of [...t.nodes,w.control,w.accessCard,w.exit,...w.cases])assert.ok(w.waypoint(w.start.x,w.start.z,n.x,n.z,{startY:w.start.y,endY:n.y,fullPath:true,ignoreGates:true}),`${chapter}/${seed}/${n.id||n.gun||'objective'}`);}assert.equal(signatures.size,12);
});
test('legacy save worlds retain the original puzzle contract and chapter tasks serialize stage transitions',()=>{
 const old=new MissionTasks(makeWorld(2709,0),0);assert.ok(old.fuses.length===2&&!old.powered);const w=makeWorld(2709,1,1),tasks=new MissionTasks(w,1);for(const i of solveSliding(tasks.current.state.board))tasks.use('cargo-slide-'+i);assert.equal(tasks.kind,'pressure');const copy=new MissionTasks(w,1);copy.restore(JSON.parse(JSON.stringify(tasks.snapshot())));assert.deepEqual(copy.snapshot(),tasks.snapshot());for(let i=0;i<3;i++)if(copy.current.target&(1<<i))copy.use('pressure-'+i);assert.ok(copy.solved);
});
test('compass replans immediately from moved cells, changes relative bearing with yaw and handles gated goals',()=>{
 const w=world(),g=new RouteGuide(w),goal=w.control,p={...w.start,yaw:0};g.update(p,goal,.01);assert.ok(g.next);assert.ok(g.portal);const rev=g.revision,rel=g.relative;g.update({...p,yaw:Math.PI/2},goal,0);assert.ok(Math.abs(Math.atan2(Math.sin(g.relative-rel),Math.cos(g.relative-rel))+Math.PI/2)<.001);assert.equal(g.revision,rev);const point=g.route[12];g.update({...point,yaw:0},goal,.01);assert.ok(g.revision>rev);assert.ok(Math.hypot(g.route[0].x-point.x,g.route[0].z-point.z)<.01);
 const gate=w.gates.find(g=>g.id==='security');g.update({...w.rooms.find(r=>r.id==='lock').center,yaw:0},gate,1);assert.ok(g.next);assert.ok(!g.route.some(p=>w.at(p.x,p.z,p.y)?.gate==='security'));
});
test('following the compass reaches objectives and overhead decks using real movement in all twelve chapters',()=>{
 const actions=new Set();for(let chapter=0;chapter<12;chapter++){const w=makeWorld(2709+chapter*911,CHAPTERS[chapter].theme,chapter);for(const goal of[w.control,w.overpass.goal]){const p={...w.start,yaw:0,grounded:true,vy:0,safe:{...w.start}},guide=new RouteGuide(w);let arrived=false;for(let f=0;f<6000;f++){guide.update(p,goal,1/30);actions.add(guide.action);if(Math.hypot(p.x-goal.x,p.z-goal.z)<2&&Math.abs(p.y-goal.y)<.6){arrived=true;break;}assert.ok(guide.next,`${chapter}: no guidance`);p.yaw+=guide.relative;w.tick(1/30,p);movePlayer(p,w,1/30,{forward:guide.action.startsWith('WAIT')||guide.action.startsWith('RIDE')?0:1});}assert.ok(arrived,`${chapter}: ${JSON.stringify(p)} -> ${JSON.stringify(guide.next)} (${guide.action})`);}}
 for(const action of['PASSAGE','STAIRS UP','STAIRS DOWN'])assert.ok(actions.has(action),action);
});

test('compass boards a moving lift, rides to the chosen floor and exits onto its landing',()=>{
 const w=makeWorld(2709,0,0),l=w.lifts[0],p={x:l.x-6,z:l.z,y:l.low,yaw:0,grounded:true,vy:0,safe:{x:l.x-6,z:l.z,y:l.low}},goal={x:l.x+6,z:l.z,y:l.high},g=new RouteGuide(w),actions=new Set();let arrived=false;
 for(let i=0;i<900;i++){g.update(p,goal,1/60);actions.add(g.action);if(Math.hypot(p.x-goal.x,p.z-goal.z)<.5&&Math.abs(p.y-goal.y)<.2){arrived=true;break;}p.yaw+=g.relative;w.tick(1/60,p);movePlayer(p,w,1/60,{forward:g.action.startsWith('WAIT')||g.action.startsWith('RIDE')?0:1});}
 assert.ok(arrived,JSON.stringify({p,next:g.next,action:g.action}));assert.ok(actions.has('RIDE UP'));assert.ok(actions.has('EXIT LIFT'));
});
