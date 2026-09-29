import * as THREE from '../vendor/three.module.js';
const spritePool=[];
export function clearEffectPool(){for(const s of spritePool)s.material.dispose();spritePool.length=0;}
export function releaseEffectSprite(sprite){sprite.removeFromParent();if(spritePool.length<128){sprite.visible=false;spritePool.push(sprite);}else sprite.material.dispose();}
export function effectSprite(atlas,row,col,x,y,z,size,color='#ffffff',sheet='attackVfx'){
 const sprite=spritePool.pop()||new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,alphaTest:.06,depthWrite:false,fog:true}));
 sprite.material.map=atlas.texture(atlas.frame(sheet,col,row));sprite.material.color.set(color);sprite.material.opacity=1;sprite.material.rotation=0;sprite.material.depthWrite=false;sprite.material.alphaTest=.06;sprite.material.fog=true;sprite.visible=true;sprite.center.set(.5,.5);sprite.position.set(x,y,z);sprite.scale.set(size,size,1);return sprite;
}
export function areaEffect(atlas,x,y,z,color,row=2){
 const group=new THREE.Group();group.position.set(x,y,z);group.userData.area={row};group.add(effectRing(atlas,0,.03,0,color));
 for(let i=0;i<12;i++){const s=effectSprite(atlas,row,2,0,0,0,1,'#ffffff','areaVfx');s.center.set(.5,.08);group.add(s);}
 return group;
}
export function animateArea(group,atlas,radius,age,opacity=1){
 const row=group.userData.area.row,ring=group.children[0];ring.scale.setScalar(Math.max(.05,radius*2.45));ring.material.map=atlas.texture(atlas.frame('attackVfx',2+Math.floor(age*10)%2,4));ring.material.opacity=opacity*.75;
 for(let i=1;i<group.children.length;i++){const sprite=group.children[i],angle=(i-1)*Math.PI/6,size=1.05+Math.min(1.2,radius*.12);sprite.position.set(Math.cos(angle)*radius,.04,Math.sin(angle)*radius);sprite.scale.set(size,size*(row===3?1:1.3),1);sprite.material.map=atlas.texture(atlas.frame('areaVfx',1+(Math.floor(age*13)+i%3)%5,row));sprite.material.opacity=opacity;}
}
export function effectRing(atlas,x,y,z,color){
 const material=new THREE.MeshBasicMaterial({map:atlas.texture(atlas.frame('attackVfx',0,4)),color,transparent:true,alphaTest:.1,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);return mesh;
}
export function effectBeam(atlas,from,to,color,width,camera,sheet='attackVfx',row=5){
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(12),3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,0,1,1,0,1,1],2));g.setIndex([0,2,1,2,3,1]);
 const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:atlas.texture(sheet.startsWith('ray-')?rayFrame(sheet,0):atlas.frame(sheet,0,row)),color,transparent:true,alphaTest:.08,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true}));mesh.frustumCulled=false;mesh.userData.beam={from:{...from},to:{...to},width};orientBeam(mesh,camera);return mesh;
}
const rayFrames=new Map();
// A connected pixel strip, with no transparent atlas gutters at its ends.
// Eight cached animation frames keep lightning links and the prism laser whole.
export function rayFrame(kind,phase){
 phase=phase%8;const key=kind+phase;if(rayFrames.has(key))return rayFrames.get(key);
 const c=document.createElement('canvas');c.width=128;c.height=32;const x=c.getContext('2d');let previous=16;
 for(let col=0;col<c.width;col++){
  const y=kind==='ray-electric'?16+Math.round(Math.sin(col*.35+phase*1.6)*4+Math.sin(col*.81-phase)*2):16;
  const lo=Math.min(y,previous),hi=Math.max(y,previous);previous=y;
  x.fillStyle=kind==='ray-electric'?'#713ace':'#bd531e';x.fillRect(col,lo-6,1,hi-lo+13);
  x.fillStyle=kind==='ray-electric'?'#b59bff':'#ffb842';x.fillRect(col,lo-3,1,hi-lo+7);
  x.fillStyle=kind==='ray-electric'?'#edfbff':'#fffbd2';x.fillRect(col,lo-1,1,hi-lo+3);
 }rayFrames.set(key,c);return c;
}
export function orientBeam(mesh,camera){
 const{from:a,to:b,width}=mesh.userData.beam,axis=beamAxis.set(b.x-a.x,b.y-a.y,b.z-a.z),side=beamSide.copy(axis).cross(beamView.set(camera.position.x-(a.x+b.x)*.5,camera.position.y-(a.y+b.y)*.5,camera.position.z-(a.z+b.z)*.5));
 if(side.lengthSq()<.000001)side.crossVectors(axis,camera.up);side.normalize().multiplyScalar(width*.5);
 const p=mesh.geometry.attributes.position;p.setXYZ(0,a.x-side.x,a.y-side.y,a.z-side.z);p.setXYZ(1,a.x+side.x,a.y+side.y,a.z+side.z);p.setXYZ(2,b.x-side.x,b.y-side.y,b.z-side.z);p.setXYZ(3,b.x+side.x,b.y+side.y,b.z+side.z);p.needsUpdate=true;
}
const beamAxis=new THREE.Vector3(),beamSide=new THREE.Vector3(),beamView=new THREE.Vector3();
