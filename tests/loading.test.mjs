import test from'node:test';import assert from'node:assert/strict';
import{AssetLoader}from'../src/asset-loader.js';import{missionAssets,TITLE_ASSETS}from'../src/asset-plan.js';import{SPECS,THEMES}from'../src/atlas.js';import{CHAPTERS}from'../src/campaign.js';import{NetRoom,PROTOCOL}from'../src/network.js';
test('chapter loading leaves other themes and absent crew on disk, but covers every active pilot weapon',()=>{
 assert.deepEqual(TITLE_ASSETS,['hudSkin']);for(let i=0;i<12;i++){const solo=missionAssets(i),theme=THEMES[CHAPTERS[i].theme].id;assert.ok(solo.every(id=>SPECS[id]));assert.ok(!solo.some(id=>id.startsWith('crew-')));assert.deepEqual(solo.filter(id=>id.startsWith('dressing-')),['dressing-'+theme]);const room=missionAssets(i,['rook','echo']);assert.equal(room.filter(id=>id.startsWith('crew-')).length,14);assert.ok(!room.includes('crew-flint-bolt'));assert.ok(room.includes('clinger-pods'));}
 assert.ok(missionAssets(0,[],['gnats']).includes('gnats'));
});
test('asset queue deduplicates paths, bounds simultaneous decodes, and retries failures',async()=>{
 const requests=[],loader=new AssetLoader({concurrency:2,source:p=>p,image:()=>{const image={decode:async()=>{}};Object.defineProperty(image,'src',{set(path){requests.push({image,path});}});return image;}});
 const a=loader.get('a'),duplicate=loader.get('a'),b=loader.get('b'),c=loader.get('c');assert.equal(a,duplicate);assert.equal(requests.length,2);requests[0].image.onload();await a;await new Promise(r=>setTimeout(r,0));assert.equal(requests.length,3);requests[1].image.onload();requests[2].image.onload();await Promise.all([b,c]);assert.equal(loader.peak,2);
 const failure=loader.get('bad'),rejected=assert.rejects(failure,/Unable to load/);requests.at(-1).image.onerror();await rejected;const retry=loader.get('bad');await new Promise(r=>setTimeout(r,0));requests.at(-1).image.onload();await retry;assert.equal(loader.completed,4);
});
test('host waits for all matching load acknowledgements before starting; stale and duplicate acknowledgements cannot deploy',async()=>{
 const room=new NetRoom(()=>{}),messages=[];room.role='host';room.self='host';room.members=[{id:'host',pilot:'rook'},{id:'b',pilot:'echo'},{id:'c',pilot:'flint'}];for(const m of room.members.slice(1))room.connections.set(m.id,{peer:m.id,open:true,send:d=>messages.push(d)});
 const waiting=room.prepare({seed:2709,chapter:0});let done=false;waiting.then(()=>done=true);assert.equal(room.active,false);assert.equal(room.start({}),false);
 room.receive(room.connections.get('b'),{v:PROTOCOL,type:'loaded',runId:'old'});assert.equal(room.pendingLoads.size,2);
 for(let i=0;i<2;i++)room.receive(room.connections.get('b'),{v:PROTOCOL,type:'loaded',runId:room.runId});assert.equal(room.pendingLoads.size,1);assert.equal(done,false);
 room.receive(room.connections.get('c'),{v:PROTOCOL,type:'loaded',runId:room.runId});await waiting;assert.equal(room.start({seed:2709,chapter:0}),true);assert.equal(room.active,true);assert.equal(messages.filter(m=>m.type==='start').length,2);
});
test('failed and cancelled room loads reject the barrier and never activate combat',async()=>{
 const room=new NetRoom(()=>{});room.role='host';room.members=[{id:'host'},{id:'b'}];const conn={peer:'b',open:true,send:()=>{}};room.connections.set('b',conn);const load=room.prepare({});const rejected=assert.rejects(load,/could not load/);room.receive(conn,{v:PROTOCOL,type:'loadFailed',runId:room.runId});await rejected;assert.equal(room.active,false);assert.equal(room.loading,false);assert.equal(room.start({}),false);
});
test('a connection opened just before loading cannot add a late unprepared player',async()=>{
 const room=new NetRoom(()=>{}),messages=[];room.role='host';room.members=[{id:'host',pilot:'rook'}];const conn={peer:'late',open:true,send:d=>messages.push(d)};room.connections.set('late',conn);
 await room.prepare({});room.receive(conn,{v:PROTOCOL,type:'hello',pilot:'echo'});assert.equal(room.members.length,1);assert.equal(messages.at(-1).type,'reject');room.cancelPrepare();
});
