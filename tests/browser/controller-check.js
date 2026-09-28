(async()=>{
 const result={kind:'virtual standard Gamepad API in live browser',checks:[]},check=(name,ok,detail)=>{result.checks.push({name,pass:!!ok,detail:structuredClone(detail)});if(!ok)throw Error(name+' / '+JSON.stringify(detail));};
 const frames=async(n=4)=>{for(let i=0;i<n;i++)await new Promise(requestAnimationFrame);};
 const until=async(fn,max=240)=>{for(let i=0;i<max;i++){if(fn())return;await frames(1);}throw Error('Timed out waiting for game state');};
 const original=Object.getOwnPropertyDescriptor(navigator,'getGamepads'),pad={index:0,id:'Verification standard pad',mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
 let connected=true;Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>connected?[pad]:[]});
 const button=(id,on)=>pad.buttons[id]={pressed:on,value:on?1:0},tap=async(id)=>{button(id,true);await frames(2);button(id,false);await frames(4);},state=()=>scrapper.snapshot();
 try{
  scrapper.room.leave();await frames(6);check('connected and armed',state().controller.armed,state().controller);
  await tap(0);check('A deploys without mouse lock',state().running&&!state().paused&&!document.pointerLockElement);
  const start=state().player;pad.axes[1]=-.6;await frames(12);pad.axes[1]=0;await frames(2);check('left stick moves player',Math.hypot(state().player.x-start.x,state().player.z-start.z)>.1);
  const yaw=state().player.yaw;pad.axes[2]=.6;pad.axes[3]=-.4;await frames(10);pad.axes[2]=pad.axes[3]=0;check('right stick turns and pitches',state().player.yaw<yaw&&state().player.pitch>0,state().player);
  const ammo=state().ammo.bolt.mag;button(7,true);await frames(12);button(7,false);await frames(2);check('RT fires live gun',state().ammo.bolt.mag<ammo,{before:ammo,after:state().ammo.bolt.mag});
  await tap(2);check('X begins reload',!!state().reload,state().reload);await until(()=>!state().reload);
  const ground=state().player.y;button(0,true);await frames(4);check('A jumps',state().player.y>ground||!state().player.grounded,state().player);button(0,false);await frames(4);
  scrapper.stain(['cyan','amber','violet']);await tap(1);check('B begins original single wipe',state().wipe.active&&state().wipe.asset.endsWith('legacy/visor-wipe.png'),state().wipe);await until(()=>!state().wipe.active);check('wipe clears mixed goo',state().wipe.stains===0,state().wipe);
  await tap(8);check('View opens map',state().mapOpen);await tap(1);check('B closes map',!state().mapOpen);
  const radioClosed=document.querySelector('#radio').classList.contains('closed');await tap(11);check('R3 toggles communications',document.querySelector('#radio').classList.contains('closed')!==radioClosed);await tap(11);
  // Use real case and archive actions; teleport only shortens traversal in this input check.
  const c=scrapper.locations().cases.find(c=>!c.locked&&c.gun!=='bolt');scrapper.teleport(c.x,c.z+1,c.y);scrapper.look(0,0);await tap(3);await until(()=>state().cases.some(c=>c.dispensed));check('Y opens a weapon case',state().cases.some(c=>c.open));
  scrapper.teleport(c.x,c.z,c.y);await until(()=>Object.values(state().ammo).filter(s=>s.owned).length>1);const owned=Object.entries(state().ammo).filter(([,s])=>s.owned).map(([id])=>id);check('gun acquired through case',owned.length>1,owned);
  const weapon=state().weapon;await tap(5);check('RB cycles owned weapons',state().weapon!==weapon,{before:weapon,after:state().weapon});await tap(4);check('LB cycles back',state().weapon===weapon);
  const archive=scrapper.locations().purge;scrapper.teleport(archive.x,archive.z+1,archive.y);await tap(3);check('Y opens archive choice',!!state().radio.active?.choices,state().radio.active?.id);await tap(14);check('D-pad selects story choice',state().mission.choices.some(c=>c.id==='purge'),state().mission.choices);
  await tap(9);check('Menu pauses',state().paused);const before=state().player,mag=state().ammo[state().weapon].mag;pad.axes[1]=-1;button(7,true);await frames(8);check('pause suppresses motion and fire',state().player.x===before.x&&state().player.z===before.z&&state().ammo[state().weapon].mag===mag);
  // Held trigger may navigate neither into gameplay nor continue firing after resume.
  button(7,false);pad.axes[1]=0;await frames(4);await tap(9);check('Menu resumes',!state().paused);connected=false;await frames(4);check('disconnect pauses and releases fire',state().paused&&!state().controller.input.fire);
  connected=true;button(7,true);await frames(6);check('reconnect held trigger stays disarmed',!state().controller.armed&&!state().controller.input.fire);button(7,false);await frames(4);await tap(9);
  scrapper.room.leave();await frames(6);document.querySelector('#crew-menu').open=true;document.querySelector('#room-input').focus();await tap(0);await tap(12);await tap(15);await tap(13);await tap(0);check('controller edits room code',document.querySelector('#room-input').value==='B9AAAA',document.querySelector('#room-input').value);
  document.querySelector('#crew-menu').open=false;document.querySelector('#manual-menu').open=true;document.querySelector('#pad-sensitivity').focus();const sensitivity=state().controller.settings.sensitivity;await tap(15);check('D-pad changes saved sensitivity',state().controller.settings.sensitivity>sensitivity);document.querySelector('#pad-invert').focus();await tap(15);check('invert setting changes',state().controller.settings.invertY);
  // Restore defaults for the next human playtest.
  document.querySelector('#pad-invert').value='no';document.querySelector('#pad-invert').dispatchEvent(new Event('change'));document.querySelector('#pad-sensitivity').value=1;document.querySelector('#pad-sensitivity').dispatchEvent(new Event('input'));document.querySelector('#manual-menu').open=false;
  result.pass=true;result.location=location.href;result.settingsStored=JSON.parse(localStorage.getItem('scrapper-controller'));return result;
 }catch(error){result.pass=false;result.error=error.message;result.state={player:state().player,controller:state().controller,paused:state().paused,weapon:state().weapon};return result;}
 finally{if(original)Object.defineProperty(navigator,'getGamepads',original);else delete navigator.getGamepads;scrapper.room.leave();}
})()
