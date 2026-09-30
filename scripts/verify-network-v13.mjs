import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const run=promisify(execFile),baseline=process.argv.includes('--baseline'),raw=process.argv.includes('--raw'),label=baseline?'v12':raw?'v13-raw':'v13';
const url=baseline?pathToFileURL(resolve('exports/Scrapper-Fast-Load-v12/Scrapper.html')).href:(process.env.SCRAPPER_TEST_URL||'http://127.0.0.1:4186/');
const sessions=Array.from({length:4},(_,i)=>`net-${label}-${i}`);
const call=async(s,...args)=>(await run('agent-browser',['--session',s,...args],{maxBuffer:12e6})).stdout;
const ev=async(s,code)=>JSON.parse(await call(s,'eval',code));
const until=async(fn,label)=>{for(let i=0;i<120;i++){if(await fn())return;await new Promise(r=>setTimeout(r,250));}throw Error('Timed out: '+label);};
const instrument=`(()=>{
 window.netProbe={bytes:0,messages:0,peakBuffer:0,frames:[],capture:[]};
 const send=RTCDataChannel.prototype.send;
 RTCDataChannel.prototype.send=function(data){const p=netProbe;p.bytes+=typeof data==='string'?new TextEncoder().encode(data).length:(data.byteLength||data.size||0);p.messages++;p.peakBuffer=Math.max(p.peakBuffer,this.bufferedAmount);return send.call(this,data);};
 const emit=Peer.prototype.emit;
 Peer.prototype.emit=function(event,...args){if(event==='connection'){const conn=args[0],send=conn.send.bind(conn);conn.send=function(d,...rest){if(d.type==='frame'&&netProbe.capture.length<16)netProbe.capture.push(structuredClone(d.state));return send(d,...rest);};}return emit.call(this,event,...args);};
 let last;requestAnimationFrame(function frame(now){if(last)netProbe.frames.push(now-last);if(netProbe.frames.length>1200)netProbe.frames.shift();last=now;requestAnimationFrame(frame);});return true;
})()`;
const results={label,url,scenarios:[]};
try{
 for(const s of sessions){await call(s,'open',process.argv.includes('--exports')&&s===sessions.at(-1)?pathToFileURL(resolve('exports/Scrapper-Playable-v13.html')).href:url);await until(()=>ev(s,'!!window.scrapperReady'),'title '+s);await ev(s,instrument);if(raw)await ev(s,'window.SCRAPPER_DISABLE_AURA=true;true');}
 await ev(sessions[0],"scrapper.room.host('coop','rook');true");
 await until(()=>ev(sessions[0],"scrapper.snapshot().net.code.length===6&&document.getElementById('room-status').textContent.includes('ROOM READY')"),'room code');
 const code=await ev(sessions[0],'scrapper.snapshot().net.code');
 for(const s of sessions.slice(1))await ev(s,`scrapper.room.join('${code}','rook');true`);
 await until(()=>ev(sessions[0],"document.querySelectorAll('#room-roster .roster-card').length===4"),'four players');
 await ev(sessions[0],"document.getElementById('seed').value='2709';document.getElementById('theme').value='0';scrapper.room.start();true");
 await until(async()=> (await Promise.all(sessions.map(s=>ev(s,'!!window.scrapperMissionReady')))).every(Boolean),'deployment');
 for(const scenario of ['together','split']){
  await ev(sessions[0],`(()=>{const g=scrapper,rooms=g.locations().rooms,crew=g.snapshot().net.members;return crew.map((m,i)=>{const p=rooms.find(r=>r.id===(${JSON.stringify(scenario)}==='split'?['hall','east','upper','armory'][i]:'hall')).center;return g.placeCrew(m.id,{...p,hp:100000,grabImmune:10000,grab:null,grabRecovery:0,down:false,dead:false});});})()`);
  await new Promise(r=>setTimeout(r,1000));
  await Promise.all(sessions.map(s=>ev(s,'netProbe.bytes=netProbe.messages=netProbe.peakBuffer=0;netProbe.frames=[];netProbe.started=performance.now();true')));
  // Keep a real combat workload active while measuring actual RTCDataChannel bytes.
  await ev(sessions[0],"for(const type of ['beetle','spitter','matriarch'])scrapper.attack(type,'fan');true");
  await new Promise(r=>setTimeout(r,6000));
  const peers=await Promise.all(sessions.map(s=>ev(s,`(()=>{const p=netProbe,t=performance.now()-p.started,f=p.frames.slice().sort((a,b)=>a-b),g=scrapper.snapshot();return {bytes:p.bytes,bytesPerSecond:p.bytes/t*1000,messages:p.messages,peakBuffer:p.peakBuffer,frames:f.length,medianMs:f[Math.floor(f.length*.5)],p95Ms:f[Math.floor(f.length*.95)],actors:g.actors.length,net:g.net,player:g.player,encounters:g.encounters,renderer:g.renderer};})()`)));
  results.scenarios.push({scenario,peers});if(peers.some(p=>!p.net.active||p.net.members.length!==4))throw Error('Room lost a player during '+scenario);console.log(JSON.stringify({label,scenario,peers:peers.map(p=>({bytesPerSecond:p.bytesPerSecond,p95Ms:p.p95Ms,actors:p.actors,peakBuffer:p.peakBuffer,metrics:p.net.metrics}))}));
 }
 if(baseline)await writeFile('artifacts/network-v12-frames.json',JSON.stringify(await ev(sessions[0],'netProbe.capture')));
 else await writeFile(`artifacts/network-${label}-state.json`,JSON.stringify(await ev(sessions[0],'scrapper.networkState()')));
 results.errors=await Promise.all(sessions.map(s=>call(s,'errors')));
 await writeFile(`artifacts/network-${label}.json`,JSON.stringify(results,null,2));
 if(results.errors.some(e=>e.trim()))throw Error(JSON.stringify(results.errors));
}finally{if(!process.argv.includes('--keep'))await Promise.all(sessions.map(s=>call(s,'close').catch(()=>{})));}
