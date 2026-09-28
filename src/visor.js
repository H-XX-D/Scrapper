export const GOO_COLORS={green:[114,182,42],cyan:[54,211,220],amber:[235,171,36],violet:[162,91,225],oil:[37,64,86]};
const clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
// The original four-pose glove makes one right-to-left pass, then drops away.
// The gun is below the HUD before the wiping arm enters and returns afterward.
export function wipeMotion(t){
 const sweep=clamp((t-.22)/.5),enter=smooth((t-.11)/.11),leave=smooth((t-.72)/.15);
 return{frame:t<.22?0:t<.48?1:t<.72?2:3,x:1.08-1.24*sweep,y:.38+(1-enter)*.8+leave*.9,visible:t>.11&&t<.87,gunDrop:t<.11?smooth(t/.11):t>.87?1-smooth((t-.87)/.13):1,clearEdge:1-sweep};
}
export class VisorState{
 constructor(){this.stains=[];this.active=null;this.cooldown=0;this.count=0;this.lastVariant=null;this.nextId=0;this.palette=['green'];}
 stain(seed,sticky=true,color='green'){
  if(!GOO_COLORS[color])color='green';
  this.stains.push({id:++this.nextId,x:.15+(seed*.731%1)*.7,y:.1+(seed*.437%1)*.64,size:.09+(seed*.19%1)*.13,color,colors:[color],opacity:.88});
  if(this.stains.length>18)this.stains.shift();
 }
 wipe(){
  if(this.active||this.cooldown>0)return false;
  this.palette=[...new Set(this.stains.flatMap(s=>s.colors))];
  this.lastVariant='normal';this.active={age:0,duration:1.1,ids:new Set(this.stains.map(s=>s.id))};
  this.cooldown=1.22;this.count++;return true;
 }
 update(dt){
  this.cooldown=Math.max(0,this.cooldown-dt);const active=this.active;if(!active)return null;
  active.age+=dt;const t=active.age/active.duration;
  // Only clear the splatter captured at the start; a fresh hit remains on the visor.
  const motion=wipeMotion(t);if(t>.22)this.stains=this.stains.filter(s=>!active.ids.has(s.id)||s.x< motion.clearEdge);
  if(t>=1){this.stains=this.stains.filter(s=>!active.ids.has(s.id));this.active=null;return null;}
  return{variant:'normal',t,...motion,palette:this.palette};
 }
}
