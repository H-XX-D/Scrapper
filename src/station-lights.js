import * as THREE from '../vendor/three.module.js';
export const STATION_LIGHT_REACH=35,STATION_LIGHT_BUDGET=8;
// Emissive art remains intact. A bounded, stable pool adds actual light to the
// station geometry; sources can be outside the 20m fog but still illuminate it.
export class StationLights{
 constructor(scene,world){this.world=world;this.clock=0;this.selectAge=1;this.sources=[];this.pool=Array.from({length:STATION_LIGHT_BUDGET},()=>{const light=new THREE.PointLight('#9adaed',0,STATION_LIGHT_REACH,1.25);scene.add(light);return{light,source:null};});}
 rebuild(level,station,tasks){
  this.sources=[...level.lightSources,...station.lightSources(),...tasks.lightSources()];this.selectAge=1;
 }
 update(dt,viewer){
  this.clock+=dt;this.selectAge+=dt;
  if(this.selectAge>=.2){
   this.selectAge=0;
   // Render culling hides distant fixtures, but must not switch off their
   // illumination: a source beyond the 20m camera can still light the floor.
   const candidates=this.sources.filter(s=>Math.hypot(s.x-viewer.x,s.z-viewer.z,s.y-viewer.y)<=STATION_LIGHT_REACH&&Math.abs((s.floor??s.y)-viewer.y)<7).map(s=>({s,d:Math.hypot(s.x-viewer.x,s.z-viewer.z,s.y-viewer.y)})).sort((a,b)=>a.d/(a.s.strength||7)-b.d/(b.s.strength||7));
   const selected=[];
   for(const{s}of candidates){if(selected.length===this.pool.length)break;if(!this.world.los(viewer.x,viewer.z,s.x,s.z,viewer.y+1.2,s.y))continue;selected.push(s);}
   for(const item of this.pool)if(item.source&&!selected.includes(item.source))item.source=null;
   for(const source of selected)if(!this.pool.some(item=>item.source===source))this.pool.find(item=>!item.source).source=source;
  }
  for(const item of this.pool){const s=item.source;if(!s){item.light.intensity=0;continue;}const state=s.state?.()||{};
   item.light.position.set(s.x,s.y,s.z);item.light.color.set(state.color||s.color||'#9adee9');
   const flutter=.9+.07*Math.sin(this.clock*(s.rate||2.6)+s.x)+.03*Math.sin(this.clock*11+s.z);
   item.light.intensity=(state.strength??s.strength??7)*flutter;item.light.distance=STATION_LIGHT_REACH;
  }
 }
 snapshot(){return{reach:STATION_LIGHT_REACH,budget:this.pool.length,sources:this.sources.length,active:this.pool.filter(p=>p.source).map(p=>({kind:p.source.kind,position:p.light.position.toArray(),color:p.light.color.getHexString(),intensity:p.light.intensity,reach:p.light.distance}))};}
}
