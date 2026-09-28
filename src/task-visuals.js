import * as THREE from '../vendor/three.module.js';
import{traceMirrors}from'./mission-tasks.js';
import{effectBeam,orientBeam}from'./pixel-effects.js';
const rows=['coupler','socket','pressure','mirror','sync','pump','return'];
export class TaskVisuals{
 constructor(scene,tasks,atlas,levels){
  Object.assign(this,{scene,tasks,atlas,levels});this.nodes=[];this.rays=[];
  for(const n of tasks.nodes){
   const row=n.row??Math.max(0,rows.indexOf(n.kind)),material=new THREE.SpriteMaterial({map:atlas.texture(atlas.frame('puzzleDevices',0,row)),transparent:true,alphaTest:.2});
   const sprite=n.plate?new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.2),new THREE.MeshBasicMaterial({map:material.map,transparent:true,alphaTest:.2,side:THREE.DoubleSide})):new THREE.Sprite(material);
   if(n.plate){material.dispose();sprite.rotation.x=-Math.PI/2;sprite.position.set(n.x,n.y+.04,n.z);}else{sprite.center.set(.5,0);sprite.position.set(n.x,n.y,n.z);sprite.scale.setScalar(n.kind==='coupler'?1.2:2.8);}
   scene.add(sprite);
   const label=n.kind==='coupler'?null:levels.terminal(this.readout(n),n.x,n.y+(n.plate?.07:1.65),n.z+(n.plate?0:.2),n.plate?1.65:2.35);
   if(label){scene.add(label);if(n.plate)label.rotation.x=-Math.PI/2;}
   this.nodes.push({n,sprite,label,row});
  }
  this.optics=(tasks.systems||[tasks]).find(t=>t.kind==='mirrors');
  if(this.optics){const o=this.optics.beamOrigin;this.receiver=new THREE.Sprite(new THREE.SpriteMaterial({map:atlas.texture(atlas.frame('puzzleDevices',0,7)),transparent:true,alphaTest:.2}));this.receiver.position.set(o.x+8,o.y,o.z+8);this.receiver.scale.set(1.6,1.6,1);scene.add(this.receiver);this.receiverText=levels.terminal('OPTICAL RECEIVER',o.x+8,o.y,o.z+8.18,1.4);scene.add(this.receiverText);}
  this.crane=(tasks.systems||[]).find(t=>t.kind==='crane');this.cargo=[];
  if(this.crane){const r=tasks.world.rooms.find(r=>r.id==='hall');this.craneOrigin={x:r.center.x,z:r.center.z-8,y:r.y};for(let i=0;i<2;i++){const mesh=new THREE.Sprite(new THREE.SpriteMaterial({map:atlas.texture(atlas.frame('pickups',0,2)),transparent:true,alphaTest:.2,color:i?'#ff9adc':'#92ffe2'}));mesh.center.set(.5,0);mesh.scale.setScalar(1.8);scene.add(mesh);this.cargo.push(mesh);}}
 }
 state(n){return this.tasks.stateFor?.(n)||this.tasks;}
 readout(n){const t=this.state(n);if(t.readout)return t.readout(n);if(t.solved)return'SYSTEM\nRESTORED';return n.kind==='pressure'?'VALVE +'+(1<<n.index)+'\n'+t.pressure+' / '+t.target:n.kind==='socket'?'AUX POWER\n'+t.taken.length+' / 2 COUPLERS':n.kind==='mirror'?'REFLECTOR '+(n.index+1)+'\n'+(t.mirrors[n.index]?'\\':'/'):n.kind==='sync'?'PHASE '+(n.index+1)+'\n'+(n.index<t.sync?'LOCKED':n.index===t.sync&&t.windowOpen?'ACTIVATE':'WAIT'):n.kind==='pump'?'COOLANT PUMP\n'+(t.remaining>0?Math.ceil(t.remaining)+'s':'HOLD E '+Math.round(t.charge/3*100)+'%'):'RETURN VALVE\n'+(t.remaining>0?Math.ceil(t.remaining)+'s':'NO PRESSURE');}
 update(camera){
  for(const{n,sprite,label,row}of this.nodes){const t=this.state(n);sprite.visible=this.tasks.visible(n);if(label){label.visible=sprite.visible;label.userData.setText(this.readout(n));if(!n.plate)label.quaternion.copy(camera.quaternion);}
   const active=t.active?t.active(n):n.kind==='pressure'?t.valves[n.index]:n.kind==='sync'?n.index<t.sync||n.index===t.sync&&t.windowOpen:false;
   sprite.material.color.set(t.solved?'#87b993':active?'#caff83':n.tint||'#ffffff');sprite.material.map=this.atlas.texture(this.atlas.frame('puzzleDevices',active?Math.floor(t.clock*9)%8:Math.floor(t.clock*3)%8,row));
  }
  if(this.optics){const t=this.optics,visible=this.tasks.systems?this.tasks.systems.indexOf(t)<=(this.tasks.stage<0?99:this.tasks.stage):t.powered;this.receiver.visible=this.receiverText.visible=visible;this.receiver.material.color.set(t.solved?'#c4ff69':'#ff8edd');this.receiverText.userData.setText(t.solved?'OPTICAL LINK\nRESTORED':'OPTICAL RECEIVER\nALIGN BEAM');this.receiverText.quaternion.copy(camera.quaternion);
   const hash=visible+':'+t.mirrors.join(',');if(hash!==this.hash){this.hash=hash;for(const ray of this.rays){this.scene.remove(ray);ray.geometry.dispose();ray.material.dispose();}this.rays=[];if(visible)for(const s of traceMirrors(t.mirrors).segments){const pos=p=>({x:t.beamOrigin.x+p.x*2,y:t.beamOrigin.y,z:t.beamOrigin.z+p.z*2}),mesh=effectBeam(this.atlas,pos(s.from),pos(s.to),'#83dce8',.13,camera);this.scene.add(mesh);this.rays.push(mesh);}}
  }
  for(const ray of this.rays)orientBeam(ray,camera);
  if(this.crane){const s=this.crane.state,o=this.craneOrigin;this.cargo.forEach((mesh,i)=>{const held=s.carried===i,pos=held?s.hook:s.crates[i];mesh.visible=pos>=0;mesh.position.set(o.x+(pos%3-1)*2.5,o.y+(held?1.45:0),o.z+(Math.floor(pos/3)-1)*2.5);});}
 }
}
