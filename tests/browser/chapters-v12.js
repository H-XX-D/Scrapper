(async()=>{
 const g=scrapper,out={chapters:[],errors:[]};
 for(let i=0;i<12;i++){
  const at=performance.now();await g.loadSector(i);g.pause();const s=g.snapshot(),l=g.loading(),themes=l.images.filter(id=>id.startsWith('dressing-'));
  const c={chapter:i,theme:s.theme,seconds:(performance.now()-at)/1000,cells:s.layout.cells,pods:s.clingerPods.length,clusterRows:[...new Set(s.clingerPods.map(p=>p.row))],far:s.view.far,lights:s.stationLights,assets:l.assets,themes};out.chapters.push(c);
  if(themes.length!==1||themes[0]!=='dressing-'+s.theme||s.view.far!==20||!s.running||!s.ready||s.stationLights.budget!==8||s.stationLights.reach!==35)out.errors.push(c);
 }
 const before=g.snapshot();out.saved=g.save();out.loaded=await g.load();g.pause();const after=g.snapshot();out.restore={chapter:after.chapter,podsEqual:JSON.stringify(before.clingerPods)===JSON.stringify(after.clingerPods),position:[after.player.x,after.player.y,after.player.z]};
 if(!out.saved||!out.loaded||before.chapter!==after.chapter||!out.restore.podsEqual)out.errors.push({error:'save restore'});
 out.removedHud={enemyHealth:!document.getElementById('target'),escapePrompt:!document.getElementById('escape-callout')};
 if(!Object.values(out.removedHud).every(Boolean))out.errors.push(out.removedHud);
 return out;
})()
