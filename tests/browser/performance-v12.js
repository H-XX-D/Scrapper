(async()=>{
 const g=scrapper;document.getElementById('seed').value='2709';document.getElementById('theme').value='0';await g.start();await g.loadSector(0);g.pause();
 const r=g.locations().rooms.find(r=>r.id==='hall').center,id=g.snapshot().net.members[0].id;
 g.placeCrew(id,{x:r.x,y:r.y,z:r.z+5,hp:100000,grabImmune:10000,grab:null,grabRecovery:0});g.look(0);
 for(let i=0;i<3;i++)g.damageNest(i);for(const type of['spitter','beetle','guardian'])for(let i=0;i<6;i++)g.attack(type,'fan');g.step(.1);
 const updates=[];for(let i=0;i<120;i++){const at=performance.now();g.step(1/60);updates.push(performance.now()-at);}updates.sort((a,b)=>a-b);
 g.resume();const times=[],calls=[],triangles=[];let last;
 await new Promise(resolve=>{let warm=30;const frame=now=>{if(last&&warm--<=0){times.push(now-last);const r=g.snapshot().renderer;calls.push(r.calls);triangles.push(r.triangles);}last=now;if(times.length<270)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
 g.pause();times.sort((a,b)=>a-b);const s=g.snapshot(),mean=a=>a.reduce((a,b)=>a+b)/a.length;
 return{viewport:[innerWidth,innerHeight],userAgent:navigator.userAgent,actors:s.actors.length,frames:times.length,medianMs:times[135],p95Ms:times[Math.floor(times.length*.95)],maxMs:times.at(-1),over33:times.filter(t=>t>33.4).length,meanCalls:mean(calls),meanTriangles:mean(triangles),cpuUpdate:{medianMs:updates[60],p95Ms:updates[114],meanMs:mean(updates)},stationLights:s.stationLights,combatLights:s.lights,art:g.art()};
})()
