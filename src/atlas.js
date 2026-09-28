import * as THREE from '../vendor/three.module.js';
import{ACTORS,WEAPONS,PILOTS,ANIMATIONS}from'./catalog.js';
import{CREW_LAYOUTS}from'./crew-layouts.js';
import{GOO_COLORS}from'./visor.js';
import{recolorSuit}from'./suit-palette.js';
export const THEMES=[
 {id:'transit',name:'Freight Transit',subtitle:'Breach the cargo spine',color:'#8cbbc7',fog:'#111c24'},
 {id:'research',name:'Overgrown Research',subtitle:'Recover the living archive',color:'#98bb73',fog:'#17221f'},
 {id:'cryo',name:'Frozen Maintenance',subtitle:'Restart the coolant network',color:'#98d5ee',fog:'#172632'},
 {id:'foundry',name:'Reactor Foundry',subtitle:'Silence the machine choir',color:'#e6a065',fog:'#251c1e'}
];
export const SPECS={...Object.fromEntries(Object.keys(ACTORS).map(id=>[id,{path:ACTORS[id].asset,cols:ACTORS[id].cols,rows:6,key:'magenta',...(ACTORS[id].art.startsWith('boss')?{bossRow:Number(ACTORS[id].art.slice(4))}:{})}])),
 legacyProps:{path:'assets/legacy/zone-props-side-v18.png',cols:4,rows:6,key:'magenta',bounds:[0,239,490,738,975,1215,1536],boundHeight:1536},
 scenery:{path:'assets/legacy/scenery.png',cols:4,rows:2,key:'magenta'},
 splatter:{path:'assets/legacy/green-splatter-atlas.png',cols:4,rows:4,key:'magenta'},
 bursts:{path:'assets/generated/combat-bursts-v3.png',cols:4,rows:4,key:'magenta',padding:8},
 oldLoot:{path:'assets/legacy/monsters-loot.png',cols:4,rows:3,key:'magenta',bounds:[0,380,660,1024],boundHeight:1024},
 hudSkin:{path:'assets/legacy/hud-skin-v18.png',cols:1,rows:1},
 deathBursts:{path:'assets/generated/creature-bursts.png',cols:8,rows:4,key:'magenta'},
 coloredSplatter:{path:'assets/generated/colored-splatter.png',cols:4,rows:4,key:'magenta'},
 pod:{path:'assets/generated/pod.png',cols:8,rows:4,key:'magenta'},pickups:{path:'assets/generated/pickups.png',cols:8,rows:3,key:'magenta',inset:3},
 portraits:{path:'assets/legacy/story-portraits.png',cols:4,rows:4,key:'neutral'},wipe:{path:'assets/legacy/visor-wipe.png',cols:4,rows:1,key:'magenta',padding:6},
 onehand:{path:'assets/legacy/fps-weapon-onehand-v18.png',cols:1,rows:1,key:'magenta'},arsenal:{path:'assets/legacy/fps-arsenal-onehand-v18.png',cols:3,rows:3,key:'magenta'},
 ...Object.fromEntries(WEAPONS.map(w=>['reload-'+w.id,{path:`assets/generated/reload-${w.id}.png`,cols:4,rows:3,key:'magenta'}])),
 ...Object.fromEntries(THEMES.map(t=>['env-'+t.id,{path:`assets/generated/env-${t.id}.png`,cols:4,rows:4}]))};
SPECS.attackVfx={path:'assets/generated/attack-vfx-padded.png',cols:8,rows:8,key:'magenta',bounds:[0,160,313,457,615,784,920,1086,1254],xBounds:[0,157,313,470,627,784,940,1097,1254],boundHeight:1254,boundWidth:1254,padding:4};
SPECS.originalGore={path:'assets/generated/original-hit-gore-padded.png',cols:8,rows:8,key:'magenta',bounds:[0,157,313,470,627,784,939,1095,1254],xBounds:[0,153,296,458,627,784,940,1097,1254],boundHeight:1254,boundWidth:1254,padding:4};
for(const pilot of Object.keys(PILOTS))for(const w of WEAPONS)SPECS['crew-'+pilot+'-'+w.id]={path:'assets/generated/crew-'+pilot+'-'+w.id+'.png',cols:8,rows:8,key:'magenta',...CREW_LAYOUTS['crew-'+pilot+'-'+w.id]};
SPECS.stationMotion={path:'assets/generated/station-motion.png',cols:8,rows:4,key:'magenta'};
SPECS.machinery={path:'assets/generated/station-machinery-v4.png',cols:4,rows:4,key:'magenta',padding:6,bounds:[0,315,601,925,1254],columnBounds:[[0,316,626,935,1254],[0,316,626,936,1254],[0,315,626,935,1254],[0,314,625,937,1254]],boundWidth:1254,boundHeight:1254};
SPECS.utilities={path:'assets/generated/station-utilities-v4.png',cols:4,rows:4,key:'magenta',padding:6,bounds:[0,313,625,917,1254],columnBounds:[[0,315,627,954,1254],[0,313,627,940,1254],[0,315,628,942,1254],[0,313,626,940,1254]],boundWidth:1254,boundHeight:1254};
SPECS.clutter={path:'assets/generated/station-clutter-v4.png',cols:4,rows:4,key:'magenta',padding:6,bounds:[0,402,803,1162,1536],columnBounds:[[0,262,523,755,1024],[0,252,502,768,1024],[0,245,519,775,1024],[0,256,519,763,1024]],boundWidth:1024,boundHeight:1536};
SPECS.stationExhaust={path:'assets/generated/station-exhaust-v4.png',cols:4,rows:4,key:'magenta',padding:8,bounds:[0,331,628,937,1254],columnBounds:[[0,314,620,943,1254],[0,314,627,940,1254],[0,313,627,940,1254],[0,314,622,943,1254]],boundWidth:1254,boundHeight:1254};
SPECS.wallGrowth={path:'assets/generated/wall-infestation-v3.png',cols:8,rows:4,key:'magenta',bounds:[0,315,600,904,1254],columnBounds:[[0,148,296,450,623,780,938,1097,1254],[0,147,291,445,622,783,939,1095,1254],[0,145,293,446,623,780,939,1097,1254],[0,143,295,447,624,781,941,1099,1254]],boundHeight:1254,boundWidth:1254,padding:8};
SPECS.areaVfx={path:'assets/generated/flame-area-vfx-v3.png',cols:8,rows:4,key:'magenta',bounds:[0,349,641,911,1254],columnBounds:[[0,152,308,464,629,792,944,1096,1254],[0,154,306,460,636,791,944,1091,1254],[0,154,305,462,639,795,947,1098,1254],[0,156,313,463,632,795,947,1097,1254]],boundHeight:1254,boundWidth:1254,padding:8};
SPECS.puzzleDevices={path:'assets/generated/puzzle-devices.png',cols:8,rows:8,key:'magenta'};
for(const t of THEMES)SPECS['env-extra-'+t.id]={path:'assets/generated/env-extra-'+t.id+'.png',cols:4,rows:4};
export class Atlas{
 constructor(){this.images={};this.cache=new Map();this.textures=new Map();}
 async load(progress=()=>{}){
  const byPath=new Map();let done=0;
  for(const spec of Object.values(SPECS))if(!byPath.has(spec.path))byPath.set(spec.path,new Promise((resolve,reject)=>{
   const img=new Image();const timer=setTimeout(()=>{if(img.complete&&img.naturalWidth)resolve(img);else reject(Error('Unable to load '+spec.path));},30000);
   img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);reject(Error('Unable to load '+spec.path));};img.src=window.__SCRAPPER_ASSETS?.[spec.path]||spec.path;
  }));
  await Promise.all(Object.entries(SPECS).map(async([id,s])=>{this.images[id]=await byPath.get(s.path);progress(++done,Object.keys(SPECS).length);}));return this;
 }

 frame(id,col=0,row=0,pilot='rook'){
  const spec=SPECS[id],img=this.images[id];if(!img)throw Error('Atlas not loaded: '+id);
  const cacheKey=`${spec.path}:${col}:${row}:${pilot}`;if(this.cache.has(cacheKey))return this.cache.get(cacheKey);
  if(spec.rects){const [sx,sy,sw,sh]=spec.rects[row][col],c=document.createElement('canvas');c.width=c.height=spec.cellSize;const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=false;x.drawImage(img,sx,sy,sw,sh,Math.floor((c.width-sw)/2),c.height-sh-6,sw,sh);const data=x.getImageData(0,0,c.width,c.height);keyBackground(data,spec.key);x.putImageData(data,0,0);this.cache.set(cacheKey,c);return c;}
  const inset=spec.inset||0,cw=img.width/spec.cols,y0=spec.bounds?spec.bounds[row]/(spec.boundHeight||1254)*img.height:row*img.height/spec.rows,y1=spec.bounds?spec.bounds[row+1]/(spec.boundHeight||1254)*img.height:(row+1)*img.height/spec.rows;
  const xBounds=spec.columnBounds?.[row]||spec.xBounds,x0=xBounds?xBounds[col]/spec.boundWidth*img.width:col*cw,x1=xBounds?xBounds[col+1]/spec.boundWidth*img.width:(col+1)*cw,pad=spec.padding||0;
  const c=document.createElement('canvas');c.width=Math.round(x1-x0-inset*2)+pad*2;c.height=Math.round(y1-y0-inset*2)+pad*2;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;ctx.drawImage(img,x0+inset,y0+inset,x1-x0-inset*2,y1-y0-inset*2,pad,pad,c.width-pad*2,c.height-pad*2);
  if(spec.key){const data=ctx.getImageData(0,0,c.width,c.height);keyBackground(data,spec.key);if(pilot!=='rook'&&(id.startsWith('reload')||['onehand','arsenal','wipe','sticky'].includes(id)))recolorSuit(data,PILOTS[pilot].hue,id,row*spec.cols+col);ctx.putImageData(data,0,0);}
  this.cache.set(cacheKey,c);return c;
 }
 actor(id,state,age,duration){const spec=SPECS[id],s=state==='recover'?'idle':state;
  if(spec.bossRow!==undefined)return this.frame(id,s==='death'||s==='hurt'?3:s==='tell'||s==='altTell'?1:s==='attack'||s==='altAttack'?2:0,spec.bossRow);
  const row=ANIMATIONS[s]?.row??0,loop=s==='idle'||s==='move';let col=loop?Math.floor(age*(s==='move'?10:6))%spec.cols:Math.min(spec.cols-1,Math.floor(age/Math.max(.05,duration||.8)*spec.cols));
  if(ACTORS[id].art==='worm'&&row===3&&col===3)col=2;
  return this.frame(id,col,row);
 }

 wipeFrame(id,col,row,pilot,palette=['green']){
  const base=this.frame(id,col,row,pilot);
  if(id==='wipe'){
   if(col===0||col===3)return base;
   const key=`original-wipe:${col}:${pilot}:${palette.join(',')}`;if(this.cache.has(key))return this.cache.get(key);
   const c=document.createElement('canvas');c.width=base.width;c.height=base.height;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(base,0,0);x.globalCompositeOperation='source-atop';
   // Reuse the game's blood sprites, masked to the original glove; no second hand or smear pass.
   for(let i=0;i<palette.length;i++){const color=palette[i],art=color==='green'?this.frame('splatter',(i+1)%4,1):this.frame('coloredSplatter',(i+col)%4,['cyan','amber','violet','oil'].indexOf(color));const size=c.width*.56;x.globalAlpha=.78;x.drawImage(art,c.width*(col===1?.15:.2)+i*c.width*.025,c.height*(col===1?.18:.28)+i*c.height*.018,size,size*.85);}
   x.globalCompositeOperation='source-over';x.globalAlpha=1;this.cache.set(key,c);return c;
  }
  if(palette.length===1&&palette[0]==='green')return base;
  const key=`goo:${id}:${col}:${row}:${pilot}:${palette.join(',')}`;if(this.cache.has(key))return this.cache.get(key);
  const c=document.createElement('canvas');c.width=base.width;c.height=base.height;const ctx=c.getContext('2d');ctx.drawImage(base,0,0);const data=ctx.getImageData(0,0,c.width,c.height),d=data.data;
  for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(!d[i+3]||g<38||g<r*1.12||g<b*1.2)continue;
   const x=(i/4)%c.width,y=Math.floor(i/4/c.width),wave=((x/c.width)*palette.length+(Math.sin(y*.06)*.18)+palette.length)%palette.length,j=Math.floor(wave),blend=(wave-j)*.65;
   const a=GOO_COLORS[palette[j]],other=GOO_COLORS[palette[(j+1)%palette.length]],shade=g/190;
   for(let n=0;n<3;n++)d[i+n]=Math.min(255,(a[n]*(1-blend)+other[n]*blend)*shade);
  }ctx.putImageData(data,0,0);this.cache.set(key,c);return c;
 }
 texture(canvas){if(this.textures.has(canvas))return this.textures.get(canvas);const t=new THREE.CanvasTexture(canvas);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;this.textures.set(canvas,t);return t;}
}
// Runtime chroma-key import. Source art stays untouched; neutral keys are flood-filled from edges to preserve metal highlights.
function keyBackground(image,mode){const{data:d,width:w,height:h}=image,isKey=i=>{const r=d[i*4],g=d[i*4+1],b=d[i*4+2];return mode==='black'?Math.max(r,g,b)<25:mode==='magenta'?(r>190&&b>180&&g<90&&Math.abs(r-b)<65):(Math.max(r,g,b)-Math.min(r,g,b)<20&&Math.min(r,g,b)>140);};
 if(mode==='magenta'||mode==='black'){for(let i=0;i<w*h;i++)if(isKey(i))d[i*4+3]=0;return;}
 const seen=new Uint8Array(w*h),q=new Int32Array(w*h);let read=0,write=0;const push=i=>{if(i>=0&&i<w*h&&!seen[i]&&isKey(i)){seen[i]=1;q[write++]=i;}};
 for(let x=0;x<w;x++){push(x);push((h-1)*w+x);}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1);}
 while(read<write){const i=q[read++];d[i*4+3]=0;if(i%w)push(i-1);if(i%w<w-1)push(i+1);push(i-w);push(i+w);}
}
