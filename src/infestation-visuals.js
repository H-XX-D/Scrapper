import * as THREE from '../vendor/three.module.js';
export class InfestationVisuals{
 constructor(scene,system,atlas){Object.assign(this,{scene,system,atlas});this.meshes=new Map();this.update();}
 update(){const alive=new Set();for(const p of this.system.patches){alive.add(p.id);let mesh=this.meshes.get(p.id);if(!mesh){
   mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.7,3.1),new THREE.MeshLambertMaterial({transparent:true,alphaTest:.08,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1}));
   mesh.position.set(p.x,p.y,p.z);mesh.rotation.y=Math.atan2(p.nx,p.nz);this.scene.add(mesh);this.meshes.set(p.id,mesh);
  }
  const map=this.atlas.texture(this.atlas.frame('wallGrowth',this.system.frame(p),p.type));if(mesh.material.map!==map){mesh.material.map=map;mesh.material.emissiveMap=map;mesh.material.needsUpdate=true;}
  mesh.material.emissive.set(p.dead?'#000000':p.burn>0?'#ffd58a':'#ffffff');mesh.material.emissiveIntensity=p.dead?0:p.burn>0?.85:.22+.07*Math.sin(p.age*3);mesh.material.color.set(p.burn>0?'#ffd58a':'#ffffff');
 }
 for(const[id,mesh]of this.meshes)if(!alive.has(id)){this.scene.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();this.meshes.delete(id);}}
}
