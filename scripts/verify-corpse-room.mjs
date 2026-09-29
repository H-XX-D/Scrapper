import{execFileSync}from'node:child_process';import{writeFileSync}from'node:fs';
const sessions=['scrapper-v10','v10-guest1','v10-guest2','v10-guest3'];
const ev=(s,code)=>JSON.parse(execFileSync('agent-browser',['--session',s,'eval',code],{encoding:'utf8',maxBuffer:4e6}));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
ev(sessions[0],'window.scrapper.room.start();true');await wait(700);
ev(sessions[0],'(()=>{const g=window.scrapper;for(const m of g.snapshot().net.members)g.placeCrew(m.id,{...m.player,hp:10000,hurtCooldown:1000,down:false,dead:false});g.corpseTest(90);return true;})()');await wait(400);
const out={before:{},after:{}};for(const s of sessions)out.before[s]=ev(s,'window.scrapper.snapshot().corpses');
ev(sessions[0],'window.scrapper.step(13);true');await wait(500);
for(const s of sessions)out.after[s]=ev(s,'window.scrapper.snapshot().corpses');
const ids=a=>a.map(b=>b.id).sort((a,b)=>a-b).join(',');out.shared=sessions.every(s=>ids(out.after[s])===ids(out.after[sessions[0]]));out.capped=Object.values(out.before).every(a=>a.length<=30&&Object.values(Object.groupBy(a,b=>b.room)).every(b=>b.length<=5));out.grounded=Object.values(out.after).every(a=>a.every(b=>b.offset===0&&b.renderY===b.ground));out.thinned=out.after[sessions[0]].length<out.before[sessions[0]].length;writeFileSync('artifacts/corpses-room-v10.json',JSON.stringify(out,null,2));console.log(JSON.stringify({shared:out.shared,capped:out.capped,grounded:out.grounded,thinned:out.thinned,counts:sessions.map(s=>[s,out.before[s].length,out.after[s].length])}));

if(!out.shared||!out.capped||!out.grounded||!out.thinned)throw Error('Multiplayer corpse verification failed');
