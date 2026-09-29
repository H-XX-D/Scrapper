// Data-only, host-authoritative captures. Input edges survive coalesced network frames.
export const RECOVERY_DURATION=1.15,PEEL_DURATION=1.65,GRAB_DURATION=14,ESCAPE_STEPS=10;
export const DIRECTIONS=['left','back','forward','right'];
export const GRAB_KEYS={KeyA:'left',KeyS:'back',KeyW:'forward',KeyD:'right'};
export const PARASITES=['facehugger','gnats','burrower'];
export function struggleDirection(input={}){const x=input.strafe||0,y=input.forward||0;if(Math.max(Math.abs(x),Math.abs(y))<.55)return'';return Math.abs(x)>Math.abs(y)?x>0?'right':'left':y>0?'forward':'back';}
export class StruggleInput{
 constructor(){this.serial=0;this.events=[];this.pad='';}
 tap(direction){if(!DIRECTIONS.includes(direction))return;this.events.push({id:++this.serial,direction});if(this.events.length>32)this.events.shift();}
 samplePad(x,y){const d=struggleDirection({strafe:x,forward:y});if(d&&d!==this.pad)this.tap(d);this.pad=d;}
}
export function grabProfile(source,kind='tentacle'){
 const serial=source.grabSerial||0,variation=((source.id*17+serial*13)>>>0)%3,length=Math.min(30,source.span?.length||source.reach||3);
 const required=kind==='tentacle'?10+Math.floor(length/5)+variation:kind==='burrower'?12+variation:kind==='gnats'?9+variation:11+variation;
 return{required,wrap:kind==='tentacle'?1+length/60:.55,minHold:kind==='tentacle'?1.9+length/18:kind==='facehugger'?2.1:1.6,limit:Math.min(GRAB_DURATION,8+required*.3),strength:kind==='tentacle'?1+length/20:1.2,damage:kind==='burrower'?4:3};
}
export function beginGrab(player,source,kind='tentacle',input={}){
 if(player.hp<=0||player.grab||player.grabImmune>0||player.grabRecovery>0)return false;
 source.grabSerial=(source.grabSerial||0)+1;const profile=grabProfile(source,kind);
 player.grab={kind,patch:kind==='tentacle'?source.id:null,actor:kind==='tentacle'?null:source.id,type:kind==='tentacle'?source.type:kind,...profile,age:0,steps:0,lastDirection:'',lastInput:-1,lastTap:input.struggle?.at(-1)?.id||0,held:'',nextDamage:1.5};player.grabVisual=null;return true;
}
export function releaseGrab(player,source,reason='escaped'){
 const g=player.grab;if(!g)return;
 player.grabVisual={kind:g.kind||'tentacle',type:g.type??source?.type??0,source:(g.kind||'tentacle')==='tentacle'?{x:source?.x??player.x,y:source?.y??player.y,z:source?.z??player.z}:null};
 player.grab=null;player.grabRecovery=g.kind==='facehugger'?PEEL_DURATION:RECOVERY_DURATION;player.grabImmune=4;player.grabRelease=reason;
 if(source){if((g.kind||'tentacle')==='tentacle'){source.tentacleState='recoil';source.tentacleAge=0;source.grabTarget=null;source.grabCooldown=8;}
 else{source.attachedTo=null;source.y=0;if(source.hp>0){source.state='recover';source.age=0;source.duration=1.5;source.cooldown=3.5;}}}
}
export function grabSheet(player){const g=player.grab||player.grabVisual;if(!player.grab&&player.grabRecovery>0&&g?.kind==='facehugger')return'escape-facehugger-peel';return g?.kind==='tentacle'?'escape-tentacle-'+(g.type??0):'escape-'+(g?.kind||'facehugger');}
export function grabbedFrame(player){const g=player.grab;if(!g&&player.grabVisual?.kind==='facehugger')return Math.min(7,Math.max(0,Math.floor((1-player.grabRecovery/PEEL_DURATION)*8)));if(!g)return player.grabRecovery>.55?6:7;if(g.age<g.wrap)return g.age<g.wrap*.45?0:1;const direction=DIRECTIONS.indexOf(g.lastDirection),pulse=Math.floor(g.age*(3.5+g.strength));return 2+((Math.max(0,direction)+pulse)%4);}
export function strugglePrompt(g,controller=false){const action=g.kind==='facehugger'?'PEEL OFF':g.kind==='gnats'?'SWAT':g.kind==='burrower'?'PULL OFF':'BREAK FREE';return action+' · '+(controller?'ANY DIRECTION':'W A S D')+' · '+Math.min(100,Math.round(g.steps/g.required*100))+'%';}
export function advanceStruggle(g,input,dt){
 g.age+=dt;const events=[];
 if(Array.isArray(input.struggle)){for(const e of input.struggle){if(!Number.isSafeInteger(e.id)||e.id<=g.lastTap||!DIRECTIONS.includes(e.direction))continue;g.lastTap=e.id;events.push(e.direction);}}
 else{const dir=struggleDirection(input);if(dir&&dir!==g.held)events.push(dir);g.held=dir;}
 if(input.paused)return false;
 // Every fresh direction tap counts. There is no prescribed key order.
 for(const direction of events){g.lastDirection=direction;g.lastInput=g.age;g.steps=Math.min(g.required,g.steps+1);}
 return g.steps>=g.required&&g.age>=g.minHold;
}

export function firstPersonGrab(player){return(player.grab?.kind||(player.grabRecovery>0?player.grabVisual?.kind:null))==='facehugger';}

// Only the current captor's small interaction tick bypasses capture protection.
export function captureDamageAllowed(player,capture=null){
 if(!player.grab&&!player.grabRecovery)return true;
 const g=player.grab;return !!(g&&capture&&capture.kind===g.kind&&capture.id===(g.actor??g.patch));
}
