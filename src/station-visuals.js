import * as THREE from'../vendor/three.module.js';
import{STATION_PROPS,propPhase}from'./station-props.js';
export class StationVisuals{
 constructor(scene,props,atlas){Object.assign(this,{scene,props,atlas});this.group=new THREE.Group();scene.add(this.group);this.items=[];this.bounds=new Map();this.staticBatches=new Map();this.stats={visible:0,steam:0,total:props.length};
  // Static themed dressing shares sixteen instanced batches per map. Extra pipes
  // and instruments do not add one draw call per object during busy fights.
  for(const kind of new Set(props.filter(p=>STATION_PROPS[p.kind].static).map(p=>p.kind))){
   const d=STATION_PROPS[kind],items=props.filter(p=>p.kind===kind),frame=atlas.frame(d.sheet,d.col,d.row),map=atlas.texture(frame),geometry=new THREE.PlaneGeometry(d.w,d.h);geometry.translate(0,d.h*(.5-this.artBounds(kind).bottom),0);
   const material=new THREE.MeshLambertMaterial({map,emissiveMap:map,emissive:'#ffffff',emissiveIntensity:.045,transparent:true,alphaTest:.12,side:THREE.DoubleSide,forceSinglePass:true}),mesh=new THREE.InstancedMesh(geometry,material,items.length),pose=new THREE.Object3D();
   items.forEach((p,i)=>{pose.position.set(p.x+p.nx*.055,p.y+p.mount,p.z+p.nz*.055);pose.rotation.y=Math.atan2(p.nx,p.nz);pose.updateMatrix();mesh.setMatrixAt(i,pose.matrix);this.items.push({p,d,mesh,static:true,puffs:[]});});mesh.computeBoundingSphere();this.group.add(mesh);this.staticBatches.set(kind,mesh);
  }
  for(const p of props.filter(p=>!STATION_PROPS[p.kind].static)){const d=STATION_PROPS[p.kind],frame=atlas.frame(d.sheet,d.col||0,d.row),map=atlas.texture(frame),material=new THREE.MeshLambertMaterial({map,emissiveMap:map,emissive:'#ffffff',emissiveIntensity:d.clutter?0:.075,transparent:true,alphaTest:.12,side:THREE.DoubleSide,forceSinglePass:true});
   const geometry=new THREE.PlaneGeometry(p.w,p.h),bounds=this.artBounds(p.kind),mesh=new THREE.Mesh(geometry,material);geometry.translate(0,p.h*(.5-bounds.bottom),0);
   mesh.position.set(p.x+p.nx*.05,p.y+p.mount,p.z+p.nz*.05);mesh.rotation.y=Math.atan2(p.nx,p.nz);this.group.add(mesh);const item={p,d,mesh,frame:-1,lastSound:-1,puffs:[]};
   if(d.exhaust!==undefined)for(let i=0;i<2;i++){const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:atlas.texture(atlas.frame('stationExhaust',0,d.exhaust)),transparent:true,alphaTest:.04,depthWrite:false,opacity:0,fog:true}));sprite.visible=false;this.group.add(sprite);item.puffs.push(sprite);}
   this.items.push(item);
  }
 }
 artBounds(kind){if(this.bounds.has(kind))return this.bounds.get(kind);const d=STATION_PROPS[kind];let bottom=1;
  for(let i=0;i<d.frames;i++){const c=this.atlas.frame(d.sheet,d.frames===1?d.col:i,d.row),pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let maxY=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(pixels[(y*c.width+x)*4+3]>30)maxY=Math.max(maxY,y);bottom=Math.min(bottom,(c.height-1-maxY)/c.height);}
  const b={bottom};this.bounds.set(kind,b);return b;
 }
 update(time,viewer,sound,world){
  this.stats.visible=0;this.stats.steam=0;
  for(const item of this.items){const{p,d,mesh,puffs}=item,dist=Math.hypot(p.x-viewer.x,p.z-viewer.z,p.y-viewer.y),visible=dist<23&&Math.abs(p.y-viewer.y)<8;if(item.static){if(visible)this.stats.visible++;continue;}mesh.visible=visible;for(const sprite of puffs)sprite.visible=false;if(!visible)continue;this.stats.visible++;
   if(d.billboard)mesh.rotation.y=Math.atan2(viewer.x-p.x,viewer.z-p.z);
   const state=propPhase(p,time);if(item.frame!==state.frame){item.frame=state.frame;const map=this.atlas.texture(this.atlas.frame(d.sheet,state.frame,d.row));mesh.material.map=mesh.material.emissiveMap=map;}
   if(state.puff>=0&&dist<23)for(let i=0;i<puffs.length;i++){const t=state.puff-i*.17;if(t<0||t>1)continue;const s=puffs[i],size=(d.exhaust===0?1.1:.55)+t*(d.exhaust===0?1.2:.7);s.material.map=this.atlas.texture(this.atlas.frame('stationExhaust',Math.min(3,Math.floor(t*4)),d.exhaust));s.material.opacity=Math.sin(t*Math.PI)*(d.exhaust===0?.7:.55);s.position.set(p.x+p.nx*(.2+t*1.65),Math.min(p.ceiling-.55,p.y+p.mount+p.h*.68+t*.7),p.z+p.nz*(.2+t*1.65));s.scale.set(size,size,1);s.visible=true;if(d.exhaust===0)this.stats.steam++;}
   // Only close, audible equipment contributes to the mix; weapon sound keeps priority.
   if(d.sound&&sound&&dist<11&&(d.exhaust===undefined||state.puff>=0)&&state.cycle!==item.lastSound&&world.los(viewer.x,viewer.z,p.x+p.nx*.5,p.z+p.nz*.5,viewer.y+1.2,p.y+1)){item.lastSound=state.cycle;sound.play(d.sound,{position:p,gain:d.sound==='steam'?.3:d.sound==='compactor'?.2:.13,minInterval:d.sound==='steam'?1.2:.9});}
  }
 }
 lightSources(){return this.items.filter(i=>['panel','radar','generator','coolant','junction','lifeSupport'].includes(i.p.kind)||/console|analyzer|specimen|diagnostics/i.test(i.p.kind)).map(({p,d,mesh})=>({x:p.x+p.nx*.45,y:p.y+(p.mount||0)+Math.min(1.45,p.h*.65),z:p.z+p.nz*.45,floor:p.y,kind:'screen',color:p.kind.includes('foundry')?'#ffa85f':p.kind.includes('research')?'#92e97a':p.kind==='generator'?'#b79aff':'#7dd9ee',strength:d.static?5.5:7,mesh}));}
 snapshot(time){return{...this.stats,staticBatches:this.staticBatches.size,staticProps:this.items.filter(i=>i.static).length,types:Object.fromEntries([...new Set(this.props.map(p=>p.kind))].map(k=>[k,this.props.filter(p=>p.kind===k).length])),animated:this.items.filter(i=>i.d.frames>1).length,frames:this.items.filter(i=>i.mesh.visible).slice(0,40).map(i=>({id:i.p.id,kind:i.p.kind,frame:propPhase(i.p,time).frame}))};}
}
