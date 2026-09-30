import {execFile} from 'node:child_process';import {promisify} from 'node:util';import {writeFile} from 'node:fs/promises';
const run=promisify(execFile),sessions=['net-v13-0','net-v13-1','net-v13-2','net-v13-3'];
const ev=async(s,code)=>JSON.parse((await run('agent-browser',['--session',s,'eval',code],{maxBuffer:6e6})).stdout);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const until=async(fn,label)=>{for(let i=0;i<80;i++){if(await fn())return;await wait(100);}throw Error(label);};
const results={};
for(const s of sessions)await ev(s,`(async()=>{const {NetRoom}=await import('/src/network.js'),original=NetRoom.prototype.receive;NetRoom.prototype.receive=function(...args){window.testNet=this;return original.apply(this,args);};return true;})()`);
await until(async()=> (await Promise.all(sessions.map(s=>ev(s,'!!window.testNet')))).every(Boolean),'No room instrumentation');
const crew=await ev(sessions[0],'scrapper.snapshot().net.members');
if(crew.length!==4)throw Error('Need four live clients');
await ev(sessions[0],`(()=>{const start=scrapper.locations().start;return scrapper.snapshot().net.members.map((m,i)=>scrapper.placeCrew(m.id,{x:start.x+(i%2?2:-2),z:start.z-3-i,y:start.y,hp:100000,down:false,dead:false,grabImmune:10000,grab:null,grabRecovery:0}));})()`);
await wait(300);
// A single lost decoder baseline must request a keyframe without dropping peers.
const before=await ev(sessions[1],'testNet.metrics.frames');await ev(sessions[1],'testNet.decoder.history.clear();true');
await until(()=>ev(sessions[1],`testNet.metrics.resyncs>0&&testNet.metrics.frames>${before+3}`),'No resync recovery');
results.resync=await ev(sessions[1],'({...testNet.metrics,active:testNet.active})');
// A stalled send queue affects only that viewer. Reliable action counters remain usable.
const blockedId=await ev(sessions[1],'scrapper.crewVisuals().find(m=>m.local).id');
await ev(sessions[0],`(()=>{const c=testNet.connections.get(${JSON.stringify(blockedId)});window.blockedChannel=c.dataChannel;Object.defineProperty(blockedChannel,'bufferedAmount',{configurable:true,get:()=>100000});return true;})()`);
const startFrames=await Promise.all(sessions.slice(1).map(s=>ev(s,'testNet.metrics.frames')));
await wait(650);await ev(sessions[1],'scrapper.reload();true');
results.stall={before:startFrames,during:await Promise.all(sessions.slice(1).map(s=>ev(s,'testNet.metrics.frames')))};
await ev(sessions[0],"delete blockedChannel.bufferedAmount;true");
await until(()=>ev(sessions[1],`testNet.metrics.frames>${startFrames[0]+3}`),'Stalled peer did not resume');
if(results.stall.during[0]>startFrames[0]+1||results.stall.during.slice(1).some((n,i)=>n<=startFrames[i+1]+3))throw Error('One slow peer stalled the crew '+JSON.stringify(results.stall));
// Repeated codec faults negotiate raw state only for the affected connection.
await ev(sessions[2],"testNet.decoder.accept=()=>{throw Error('Injected codec fault');};true");
await until(()=>ev(sessions[2],"testNet.metrics.codec==='raw'&&testNet.active"),'No raw fallback');
const frame=await ev(sessions[2],'testNet.metrics.frames');await wait(500);
results.fallback=await Promise.all(sessions.map(s=>ev(s,'({...testNet.metrics,active:testNet.active})')));
if(results.fallback[2].frames<=frame||results.fallback[1].codec!=='aura-delta'||results.fallback[3].codec!=='aura-delta')throw Error('Mixed codecs stopped replication');
// Inject 90ms in each direction at the application boundary, retaining order.
for(const s of sessions.slice(0,2))await ev(s,`(()=>{const original=testNet.send.bind(testNet);testNet.send=(conn,data)=>{const copy=structuredClone(data);setTimeout(()=>original(conn,copy),90);return true;};return true;})()`);
await wait(700);
results.movement=await ev(sessions[1],`(async()=>{const g=scrapper;g.resume();g.look(0);const start=g.snapshot().player,at=performance.now();let first=null,last=start.z,maxBackward=0;g.input('KeyW',true);await new Promise(resolve=>{function f(){const z=g.snapshot().player.z;if(first===null&&Math.abs(z-start.z)>.01)first=performance.now()-at;maxBackward=Math.max(maxBackward,z-last);last=z;if(performance.now()-at<600)requestAnimationFrame(f);else resolve();}requestAnimationFrame(f);});g.input('KeyW',false);await new Promise(r=>setTimeout(r,700));return {firstResponseMs:first,maxBackward,travel:start.z-g.snapshot().player.z,position:g.snapshot().player,rtt:testNet.metrics.rtt};})()`);
const authoritative=await ev(sessions[0],`scrapper.snapshot().net.members.find(m=>m.id===${JSON.stringify(blockedId)}).player`);
results.movement.error=Math.hypot(authoritative.x-results.movement.position.x,authoritative.y-results.movement.position.y,authoritative.z-results.movement.position.z);
if(results.movement.travel<2||results.movement.firstResponseMs>100||results.movement.error>.2)throw Error('Delayed movement failed '+JSON.stringify(results.movement));
// Capture animation, damage isolation and escape remain visible to every observer.
for(const s of sessions)await ev(s,"(async()=>{await scrapper.loadArt(['gnats','burrower']);return true;})()");
results.captures=[];
for(const kind of['facehugger','gnats','burrower']){
 await ev(sessions[0],`(()=>{for(const m of scrapper.snapshot().net.members)scrapper.parasiteTest(${JSON.stringify(kind)},m.pilot,m.id);return true;})()`);await wait(550);
 const poses=await Promise.all(sessions.map(s=>ev(s,'scrapper.crewVisuals().map(m=>({pilot:m.pilot,local:m.local,kind:m.position.grab?.kind,sheet:m.sprite?.frame?.sheet,visible:m.sprite?.visible}))')));
 if(poses.some(p=>p.length!==4||p.some(m=>m.kind!==kind)))throw Error('Capture mismatch '+kind);
 const escaped=await Promise.all(sessions.map(s=>ev(s,`(async()=>{scrapper.resume();let taps=0;for(;taps<45&&scrapper.snapshot().player.grab;taps++){const key=['KeyA','KeyA','KeyS','KeyW','KeyD'][taps%5];scrapper.input(key,true);scrapper.input(key,false);await new Promise(r=>setTimeout(r,130));}return {taps,clear:!scrapper.snapshot().player.grab,release:scrapper.snapshot().player.grabRelease};})()`)));
 if(escaped.some(e=>!e.clear||e.release!=='escaped'))throw Error('Escape failed '+kind);
 results.captures.push({kind,poses,escaped});await wait(1900);
}
results.final=await Promise.all(sessions.map(s=>ev(s,'({net:scrapper.snapshot().net,encounters:scrapper.snapshot().encounters})')));
await writeFile('artifacts/coop-regressions-v13.json',JSON.stringify(results,null,2));console.log(JSON.stringify({movement:results.movement,stall:results.stall,mixed:results.fallback.map(f=>f.codec),captures:results.captures.length*4}));
