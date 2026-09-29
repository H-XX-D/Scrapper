import{execFileSync}from'node:child_process';import{writeFileSync}from'node:fs';
const sessions=['scrapper-v11','v11-guest1','v11-guest2','v11-guest3'];
const ev=(s,code)=>JSON.parse(execFileSync('agent-browser',['--session',s,'eval',code],{encoding:'utf8',maxBuffer:4e6}));
ev(sessions[0],'window.scrapper.room.start();true');await new Promise(r=>setTimeout(r,800));
const out={rosters:{},captures:[],releases:[],peels:[],protection:[]};for(const s of sessions)out.rosters[s]=ev(s,'window.scrapper.snapshot().net.members.map(m=>({id:m.id,pilot:m.pilot}))');
for(const kind of ['facehugger','gnats','burrower']){
 ev(sessions[0],`(()=>{const g=window.scrapper;for(const m of g.snapshot().net.members){g.parasiteTest('${kind}',m.pilot,m.id);g.placeCrew(m.id,{x:m.player.x,y:m.player.y,z:m.player.z,hp:100,hurtCooldown:0,down:false,dead:false});}return true;})()`);
 out.protection.push(ev(sessions[0],`(()=>{const g=scrapper;return g.snapshot().net.members.map(m=>{const before=m.player.hp;g.damagePlayer(80,m.id);return{pilot:m.pilot,kind:'${kind}',blocked:g.snapshot().net.members.find(x=>x.id===m.id).player.hp===before};});})()`));
 await new Promise(r=>setTimeout(r,250));
 for(const s of sessions)out.captures.push({session:s,kind,crew:ev(s,'window.scrapper.crewVisuals().map(m=>({pilot:m.pilot,local:m.local,kind:m.position.grab?.kind,sheet:m.sprite?.frame?.sheet,row:m.sprite?.frame?.row,visible:m.sprite?.visible,opacity:m.sprite?.opacity}))')});
 const solve=`(async()=>{const g=window.scrapper,key={left:'KeyA',right:'KeyD',forward:'KeyW',back:'KeyS'};const p=g.snapshot().net.members.find(m=>m.id===(g.snapshot().net.role==='host'?'host':g.crewVisuals().find(c=>c.local).id));let taps=0;for(let i=0;i<45&&g.snapshot().player.grab;i++){const q=g.snapshot().player.grab,dir=['left','left','back','forward','right','right'][i%6];if(dir){document.dispatchEvent(new KeyboardEvent('keydown',{code:key[dir],bubbles:true}));document.dispatchEvent(new KeyboardEvent('keyup',{code:key[dir],bubbles:true}));taps++;}await new Promise(r=>setTimeout(r,140));}const v=g.snapshot();return{pilot:p.pilot,taps,release:v.player.grabRelease,clear:!v.player.grab};})()`;
 // Individual browser processes run concurrently so a remote observer does not time out awaiting input.
 const {spawn}=await import('node:child_process');const results=await Promise.all(sessions.map(s=>new Promise((resolve,reject)=>{const p=spawn('agent-browser',['--session',s,'eval',solve]);let text='';p.stdout.on('data',d=>text+=d);p.on('exit',code=>code?reject(Error(text)):resolve({session:s,kind,...JSON.parse(text)}));})));out.releases.push(...results);if(kind==='facehugger')for(const s of sessions)out.peels.push({session:s,crew:ev(s,'scrapper.crewVisuals().map(m=>({pilot:m.pilot,local:m.local,recovery:m.position.grabRecovery,sheet:m.sprite?.frame?.sheet,row:m.sprite?.frame?.row,visible:m.sprite?.visible}))'),view:ev(s,'scrapper.snapshot().view')});
 await new Promise(r=>setTimeout(r,3000));
}
writeFileSync('artifacts/coop-grabs-v11.json',JSON.stringify(out,null,2));console.log(JSON.stringify({captures:out.captures.length,releases:out.releases,correct:out.captures.every(c=>c.crew.length===4&&c.crew.every(m=>m.kind===c.kind&&(c.kind==='facehugger'&&m.local?!m.visible:m.sheet==='escape-'+c.kind&&m.visible)))},null,2));

if(!out.captures.every(c=>c.crew.length===4&&c.crew.every(m=>m.kind===c.kind&&(c.kind==='facehugger'&&m.local?!m.visible:m.sheet==='escape-'+c.kind&&m.visible&&m.row===['rook','echo','flint','eos'].indexOf(m.pilot))))||!out.releases.every(r=>r.clear&&r.release==='escaped'))throw Error('Multiplayer capture verification failed');

if(!out.protection.flat().every(p=>p.blocked)||!out.peels.every(p=>p.view.grabSheet==='fp-facehugger-peel'&&p.crew.every(m=>m.local?!m.visible:m.sheet==='escape-facehugger-peel'&&m.row===['rook','echo','flint','eos'].indexOf(m.pilot))))throw Error('Peel or capture protection sync failed');
