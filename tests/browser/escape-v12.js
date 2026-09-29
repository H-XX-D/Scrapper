(async()=>{const g=scrapper,result=window.v12EscapeReport={cases:[],errors:[],art:[]};await g.start();await g.loadArt();g.resume();document.getElementById('radio').style.visibility='hidden';
const pilots=['rook','echo','flint','eos'],keys=['KeyA','KeyA','KeyS','KeyW','KeyD','KeyD','KeyS'];
for(const pilot of pilots)for(const kind of ['facehugger','gnats','burrower']){
 const actor=g.parasiteTest(kind,pilot),before=g.snapshot();g.placeCrew(before.net.members[0].id,{...before.player,hurtCooldown:0});g.damagePlayer(80);const immune=g.snapshot().player.hp===100,start=performance.now();let count=0;
 while(g.snapshot().player.grab&&count<35){const code=keys[count++%keys.length];document.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true}));document.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true}));g.step(.16);}
 let s=g.snapshot();const hp=s.player.hp,released=s.player.grabRelease,frames=new Set(),recoveryStart=s.player.grabRecovery;
 while(g.snapshot().player.grabRecovery>0){s=g.snapshot();if(s.player.grabRecovery>.03){const beforeHit=s.player.hp;g.damagePlayer(80);if(g.snapshot().player.hp!==beforeHit)result.errors.push({kind,pilot,error:'outside recovery damage'});}frames.add(s.view.grabFrame);g.step(.07);}
 const now=g.snapshot();g.placeCrew(now.net.members[0].id,{...now.player,hurtCooldown:0});const hp2=g.snapshot().player.hp;g.damagePlayer(7);const restored=g.snapshot().player.hp===hp2-7;
 const c={pilot,kind,actor,immune,restored,released,required:before.player.grab.required,taps:count,frames:[...frames],recoveryStart,seconds:(performance.now()-start)/1000};result.cases.push(c);if(!immune||!restored||released!=='escaped'||kind==='facehugger'&&frames.size<7)result.errors.push(c);
}
g.pause();for(const id of ['fp-facehugger-peel','escape-facehugger-peel','player-projectiles','dressing-transit','dressing-research','dressing-cryo','dressing-foundry'])for(let r=0;r<(id==='player-projectiles'?8:4);r++)for(let c=0;c<(id.startsWith('dressing')?4:8);c++){
 const canvas=g.artFrame(id,c,r),data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let opaque=0,edge=0;for(let i=0;i<data.length;i+=4)if(data[i+3]>55){opaque++;const x=i/4%canvas.width,y=Math.floor(i/4/canvas.width);if(x<3||y<3||x>=canvas.width-3||y>=canvas.height-3)edge++;}if(opaque<50||edge)result.errors.push({id,c,r,opaque,edge});result.art.push({id,c,r,opaque,edge});
}
result.complete=true;return result;})()
