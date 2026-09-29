(async()=>{
 const g=window.scrapper,report={cases:[],frames:[],errors:[]};
 const ids=['fp-facehugger','escape-tentacle-0','escape-tentacle-1','escape-tentacle-2','escape-tentacle-3','escape-facehugger','escape-gnats','escape-burrower','facehugger','gnats','burrower'];
 for(const id of ids)for(let row=0;row<(id.startsWith('escape')||id.startsWith('fp-')?4:6);row++)for(let col=0;col<8;col++){
  const c=g.artFrame(id,col,row),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let pixels=0,edge=0,signature=2166136261;
  for(let i=0;i<d.length;i+=4){signature=Math.imul(signature^d[i]^d[i+1]^d[i+2]^d[i+3],16777619);if(d[i+3]>55){pixels++;const x=(i/4)%c.width,y=Math.floor(i/4/c.width);if(x<3||x>=c.width-3||y<3||y>=c.height-3)edge++;}}
  report.frames.push({id,row,col,pixels,edge,signature:signature>>>0});if(pixels<100||edge)report.errors.push({id,row,col,pixels,edge});
 }
 const pilots=['rook','echo','flint','eos'];
 for(const pilot of pilots)for(const kind of ['facehugger','gnats','burrower']){
  g.parasiteTest(kind,pilot);g.step(1);const before=g.snapshot();report.cases.push({pilot,kind,attached:before.player.grab?.kind,sheet:before.view.firstPersonGrab?'fp-facehugger':g.crewVisuals()[0].sprite.frame.sheet,firstPerson:before.view.firstPersonGrab,required:before.player.grab?.required});g.hurt(before.player.grab.actor,9999);g.step(1.3);
 }
 window.v10Report=report;return report;
})()
