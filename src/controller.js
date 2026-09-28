// Browser-standard Xbox / PlayStation layout. No browser or DOM dependency here.
export const PAD={jump:0,wipe:1,reload:2,use:3,previous:4,next:5,aim:6,fire:7,map:8,pause:9,sprint:10,comms:11,up:12,down:13,left:14,right:15};
export const CONTROLLER_DEFAULTS={sensitivity:1,deadzone:.18,invertY:false};
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
export function controllerSettings(value={}){
 return{sensitivity:Number.isFinite(value?.sensitivity)?clamp(value.sensitivity,.35,2.5):1,deadzone:Number.isFinite(value?.deadzone)?clamp(value.deadzone,.08,.35):.18,invertY:value?.invertY===true};
}
export function radialStick(x=0,y=0,deadzone=.18){
 x=Number.isFinite(x)?clamp(x,-1,1):0;y=Number.isFinite(y)?clamp(y,-1,1):0;
 const length=Math.hypot(x,y);if(length<=deadzone)return{x:0,y:0};
 const scale=(Math.min(1,length)-deadzone)/(1-deadzone)/length;return{x:x*scale,y:y*scale};
}
export function lookDelta(stick,dt,settings=CONTROLLER_DEFAULTS,aim=false){
 const length=Math.hypot(stick.x,stick.y),scale=2.8*settings.sensitivity*Math.sqrt(length)*dt*(aim?.38:1);
 return{yaw:-stick.x*scale,pitch:-stick.y*scale*(settings.invertY?-1:1)};
}
const empty=()=>({connected:false,lost:false,active:false,move:{x:0,y:0},look:{x:0,y:0},held:[],pressed:[],jump:false});
export class ControllerInput{
 constructor(settings){this.settings=controllerSettings(settings);this.index=null;this.id='';this.previous=[];this.armed=false;this.jumpTime=0;this.state=empty();}
 suspend(){this.armed=false;this.jumpTime=0;this.state=empty();}
 poll(pads,dt,focused=true){
  const available=Array.from(pads||[]).filter(p=>p?.connected!==false&&p?.mapping==='standard');
  const old=this.index,pad=available.find(p=>p.index===old&&p.id===this.id)||available[0];
  const changed=!pad||pad.index!==old||pad.id!==this.id;
  if(changed){this.suspend();this.previous=[];this.index=pad?.index??null;this.id=pad?.id||'';}
  const state=empty();state.lost=old!==null&&changed;state.connected=!!pad;
  if(!pad){this.state=state;return state;}
  const held=Array.from({length:17},(_,i)=>pad.buttons?.[i]?.pressed===true||(pad.buttons?.[i]?.value||0)>.35);
  const move=radialStick(pad.axes?.[0],pad.axes?.[1],this.settings.deadzone),look=radialStick(pad.axes?.[2],pad.axes?.[3],this.settings.deadzone);
  const active=held.some(Boolean)||!!(move.x||move.y||look.x||look.y);
  if(!focused)this.suspend();
  // A reconnect, resume or focus change must pass through neutral before firing.
  if(!this.armed){if(focused&&!active)this.armed=true;this.previous=held;this.state=state;return state;}
  state.active=active;state.held=held;state.pressed=held.map((value,i)=>value&&!this.previous[i]);state.move=move;state.look=look;
  this.jumpTime=state.pressed[PAD.jump]?.12:Math.max(0,this.jumpTime-dt);state.jump=this.jumpTime>0;
  this.previous=held;this.state=state;return state;
 }
}
export class MenuRepeat{
 constructor(){this.direction='';this.time=0;}
 tick(direction,dt){if(!direction){this.direction='';this.time=0;return'';}if(direction!==this.direction){this.direction=direction;this.time=.34;return direction;}this.time-=dt;if(this.time<=0){this.time=.12;return direction;}return'';}
}
