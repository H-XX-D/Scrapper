import * as THREE from '../vendor/three.module.js';
import{tentacleRibbon,poseTentacle}from'./tentacle-ribbon.js';
import{tentacleFrame}from'./tentacles.js';
export class InfestationVisuals{
 constructor(scene,system,atlas){Object.assign(this,{scene,system,atlas});this.meshes=new Map();this.update();}
 update(viewer,members=[],camera){const alive=new Set();for(const p of this.system.patches){alive.add(p.id);let mesh=this.meshes.get(p.id);if(!mesh){
   mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.7,3.1),new THREE.MeshLambertMaterial({map:this.atlas.texture(this.atlas.frame('wallGrowth',0,p.type)),transparent:true,alphaTest:.08,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1}));
   mesh.position.set(p.x,p.y,p.z);if(p.surface)mesh.rotation.x=p.surface==='floor'?-Math.PI/2:Math.PI/2;else mesh.rotation.y=Math.atan2(p.nx,p.nz);this.scene.add(mesh);
   const root=new THREE.Sprite(new THREE.SpriteMaterial({map:this.atlas.texture(this.atlas.frame('tentacles',0,p.type)),transparent:true,alphaTest:.12,depthWrite:false}));root.center.set(.5,.06);this.scene.add(root);const ribbon=tentacleRibbon(this.atlas,p.type),hook=new THREE.Sprite(new THREE.SpriteMaterial({map:this.atlas.texture(this.atlas.frame('tentacles',4,p.type)),transparent:true,alphaTest:.15,depthWrite:false}));this.scene.add(ribbon,hook);mesh.userData={root,links:[ribbon,hook]};this.meshes.set(p.id,mesh);
  }
  const near=!viewer||Math.hypot(p.x-viewer.x,p.z-viewer.z)<48&&Math.abs(p.floor-viewer.y)<8;mesh.visible=near;const {root,links}=mesh.userData;root.visible=near;if(!near){for(const s of links)s.visible=false;continue;}
  const map=this.atlas.texture(this.atlas.frame('wallGrowth',this.system.frame(p),p.type));mesh.material.map=map;mesh.material.emissiveMap=map;
  mesh.material.emissive.set(p.dead?'#000000':p.burn>0?'#ffd58a':'#ffffff');mesh.material.emissiveIntensity=p.dead?0:p.burn>0?.85:.24;
  root.material.map=this.atlas.texture(this.atlas.frame('tentacles',tentacleFrame(p),p.type));root.material.rotation=p.surface==='ceiling'?Math.PI:0;root.position.set(p.x+(p.nx||0)*.12,p.y+(p.surface?0:-.65),p.z+(p.nz||0)*.12);root.scale.setScalar(1.1+(p.reach||3.5)*.2);
  const target=members.find(m=>m.id===p.grabTarget)?.player,grip=p.tentacleState==='grip',winding=p.tentacleState==='windup';
  const [ribbon,hook]=links;const resting=p.span&&p.extension>0&&p.maturity>=.55;
  const active=!p.dead&&camera&&(resting||target&&(grip||winding));ribbon.visible=!!active;hook.visible=!!(active&&!grip);
  if(active){let end;if(target&&(grip||winding))end={x:target.x,y:target.y+.95,z:target.z};else{const t=Math.min(1,p.extension/p.span.length);end={x:p.x+(p.span.x-p.x)*t,y:p.y+(p.span.y-p.y)*t,z:p.z+(p.span.z-p.z)*t};}
   poseTentacle(ribbon,p,end,1,p.age,camera);hook.position.set(end.x,end.y,end.z);hook.scale.setScalar(.52);hook.material.map=this.atlas.texture(this.atlas.frame('tentacles',2+Math.floor(p.age*5)%2,p.type));hook.material.rotation=Math.sin(p.age*5)*.3;
  }
 }
 for(const[id,mesh]of this.meshes)if(!alive.has(id)){for(const o of[mesh,mesh.userData.root,...mesh.userData.links]){this.scene.remove(o);if(o.isMesh)o.geometry?.dispose();o.material.dispose();}this.meshes.delete(id);}}
}
