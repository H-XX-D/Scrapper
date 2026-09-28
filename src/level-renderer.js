import * as THREE from '../vendor/three.module.js';
import {THEMES} from './atlas.js';
export class LevelVisuals {
 constructor(world,atlas,index){this.world=world;this.atlas=atlas;this.theme=THEMES[index];this.index=index;this.group=new THREE.Group();this.lifts=[];this.gates=[];this.switches=[];this.animated=[];this.motion=[];this.age=0;this.build();}
 material(col,row,color='#ffffff'){const map=this.atlas.texture(this.atlas.frame((col>=4?'env-extra-':'env-')+this.theme.id,col%4,row));map.minFilter=THREE.NearestMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return new THREE.MeshLambertMaterial({map,color,side:THREE.DoubleSide});}
 box(x,y,z,w,h,d,col=0,row=1,color='#c4c9ca'){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),this.material(col,row,color));m.position.set(x,y,z);this.group.add(m);return m;}
 // Readouts are physical terminal faces. There is no world-space wayfinding text.
 terminal(text,x,y,z,width=1.2,rotation=0){
  const c=document.createElement('canvas');c.width=320;c.height=190;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width*190/320),new THREE.MeshBasicMaterial({map:this.atlas.texture(c),side:THREE.DoubleSide,fog:false}));mesh.position.set(x,y,z);mesh.rotation.y=rotation;this.group.add(mesh);
  const draw=value=>{if(mesh.userData.text===value)return;mesh.userData.text=value;ctx.clearRect(0,0,320,190);ctx.drawImage(this.atlas.images.hudSkin,1034,744,319,190,0,0,320,190);ctx.fillStyle='#071619';ctx.fillRect(23,27,274,132);const lines=String(value).split('\n'),colors=['#72ffe0','#ff8edd','#e6ff6e'];ctx.font='16px Pixel,monospace';ctx.textAlign='center';ctx.textBaseline='middle';lines.forEach((line,i)=>{ctx.fillStyle=colors[i%3];ctx.fillText(line,160,66+(i-(lines.length-2)/2)*28,250);});ctx.fillStyle='#9dffe040';for(let y=30;y<156;y+=4)ctx.fillRect(25,y,270,1);mesh.material.map.needsUpdate=true;};
  mesh.userData.setText=draw;draw(text);return mesh;
 }

 build(){const w=this.world,groups=new Map(),matrix=new THREE.Object3D();
  const tile=(kind,x,y,z,rx=0,ry=0,sx=2,sy=2)=>{if(!groups.has(kind))groups.set(kind,[]);groups.get(kind).push({x,y,z,rx,ry,sx,sy});};
  const wall=(kind,x,z,lo,hi,rot,width=2)=>{for(let y=lo;y<hi-.01;y+=3){const h=Math.min(3,hi-y);tile(kind,x,y+h/2,z,0,rot,width,h);}};
  for(const c of w.renderCells()){
   const x=c.x*2+1,z=c.z*2+1,variant=c.layer?(c.style??4):((Math.floor(c.x/7)+Math.floor(c.z/7)+this.index)%3===0?4+Math.abs(Math.floor(c.x/9)+Math.floor(c.z/9))%4:c.style??0);
   if(c.stair){const s=c.stair;for(let n=0;n<4;n++){const u=(n+.5)/4,offset=(u-.5)*2,level=s.from+(s.to-s.from)*(s.dir>0?(n+1)/4:(4-n)/4);tile('floor3',x+(s.axis==='x'?offset:0),level,z+(s.axis==='z'?offset:0),-Math.PI/2,0,s.axis==='x'?.5:2,s.axis==='z'?.5:2);const edge=offset+(s.dir>0?-.25:.25);tile('wall0',x+(s.axis==='x'?edge:0),level-Math.abs(s.to-s.from)/8,z+(s.axis==='z'?edge:0),0,s.axis==='x'?Math.PI/2:0,2,Math.max(.04,Math.abs(s.to-s.from)/4));}}
   else if(!c.gap)tile('floor'+((c.x+c.z)%19===0?3:variant),x,c.y,z,-Math.PI/2);
   else tile('pit',x,c.pit||-22,z,-Math.PI/2);
   tile('ceiling'+(variant>=4?variant:variant%4),x,c.ceiling,z,Math.PI/2);
   for(const[dx,dz,rotation]of[[0,1,Math.PI],[0,-1,0],[1,0,-Math.PI/2],[-1,0,Math.PI/2]]){
    const n=w.at((c.x+dx)*2+1,(c.z+dz)*2+1,c.y);
    if(!n){wall('wall'+((c.x+c.z)%7===0?1:variant),x+dx,z+dz,c.y,c.ceiling,rotation);}
    else{
     if(n.y>c.y+.06&&!c.stair&&!n.stair&&!c.liftId&&!n.liftId)wall('wall2',x+dx,z+dz,c.y,n.y,rotation);
     if(n.ceiling<c.ceiling-.1)wall('wall0',x+dx,z+dz,n.ceiling,c.ceiling,rotation);
    }
   }
   if((c.x%6===0&&c.z%6===0)||(c.room==='passage'&&(c.x+c.z)%7===0))tile('light',x,c.ceiling-.03,z,Math.PI/2,0,.18,1.5);
  }
  for(const[k,items]of groups){let mat;if(k==='light'||k==='pit')mat=new THREE.MeshBasicMaterial({color:k==='light'?this.theme.color:'#03050a',side:THREE.DoubleSide});else{const row=k.startsWith('wall')?1:k.startsWith('ceiling')?2:0,col=Number(k.at(-1));mat=this.material(col,row,k.startsWith('ceiling')?'#6e7f8d':'#d7d5cc');}
   const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),mat,items.length);items.forEach((v,i)=>{matrix.position.set(v.x,v.y,v.z);matrix.rotation.set(v.rx,v.ry,0);matrix.scale.set(v.sx,v.sy,1);matrix.updateMatrix();mesh.setMatrixAt(i,matrix.matrix);});mesh.computeBoundingSphere();this.group.add(mesh);
  }
  for(const room of w.rooms){
   const {x,z}=room.center;
   // Close overhead ribs reinforce the low industrial ceiling.
   for(let dx=-room.w*.7;dx<=room.w*.7;dx+=12){this.box(x+dx,room.y+room.height-.35,z,1,.7,room.d*1.6,1,1,'#5d717c');}
   if(room.id==='hall'||room.id==='boss')this.landmark(room);
   if(this.atlas.images.stationMotion)for(let i=0;i<3;i++){const row=i===0?0:i===1?2:this.index===1?3:1,mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),new THREE.MeshLambertMaterial({map:this.atlas.texture(this.atlas.frame('stationMotion',0,row)),transparent:true,alphaTest:.12,side:THREE.DoubleSide}));mesh.position.set(x-5+i*5,room.y+2.1,room.z1*2+.07);this.group.add(mesh);this.motion.push({mesh,row});}
  }
  for(const l of w.lifts){
   const mesh=this.box(l.x,l.y-.2,l.z,5.9,.4,5.9,3,0,'#f6cf8a');this.lifts.push({data:l,mesh});
   for(const dx of[-2.85,2.85])this.box(l.x+dx,(l.low+l.high)/2,l.z-2.9,.18,l.high-l.low+1,.18,1,1);
  }
  for(const g of w.gates){const mesh=this.box(g.x,g.y+1.8,g.z,g.axis==='z'?g.width*2:1,3.6,g.axis==='x'?g.width*2:1,g.secret&&!g.timed?2:0,g.secret&&!g.timed?1:2,g.secret?'#929f9b':'#c2d0db');this.gates.push({data:g,mesh});}
  for(const s of w.switches.filter(s=>s.timedGate||w.puzzle.required!==false)){const mesh=this.box(s.x,s.y+1.1,s.z,1.3,2.2,.6,0,3);const lamp=this.box(s.x,s.y+1.8,s.z+.34,.38,.18,.05,3,0,'#ffb662');this.switches.push({data:s,mesh,lamp});this.terminal(s.timedGate?'SHUTTER\n12 SECONDS':'RELAY '+(s.index+1),s.x,s.y+1.25,s.z+.36,1.08);}
  if(w.puzzle.required!==false){this.box(w.clue.x,w.clue.y+1.1,w.clue.z,2.8,2.2,.7,0,3);this.terminal('RELAY SEQUENCE\n'+w.puzzle.order.map(i=>i+1).join('  >  '),w.clue.x,w.clue.y+1.25,w.clue.z+.36,2.45);}
  const card=w.accessCard;this.card=this.box(card.x,card.y+.8,card.z,.65,.43,.08,0,3,'#61bbff');
  for(const p of w.props){if(p.kind==='cargo'){for(let i=0;i<3;i++)this.box(p.x+i*2.2,p.y+1,p.z+(i%2)*2,2,2,2,2,2,'#8c9e9f');}else if(p.kind==='furnace'){this.box(p.x,p.y+1.6,p.z,3,3.2,3,3,3,'#f5b17c');}else if(p.kind==='growth'){this.box(p.x,p.y+.35,p.z,4,.7,4,1,0,'#819774');}}
 }
 landmark(room){const {x,z}=room.center,y=room.y,kind=this.world.landmark;
  if(kind==='crane'){
   const beamY=y+Math.min(13,room.height-2);for(const dx of[-13,13]){this.box(x+dx,y+1.7,z-4,1.2,3.4,1.2,1,1);this.box(x+dx,beamY,z-4,2,2,22,3,0);}
   this.box(x,beamY,z-4,28,2,2,3,0);this.box(x+5,beamY-1,z-4,.13,2,.13,1,1);this.box(x+5,beamY-2,z-4,2,.5,1,3,0);
  }else if(kind==='garden'){
   for(let i=0;i<5;i++){const angle=i*Math.PI*2/5,px=x+Math.cos(angle)*11,pz=z+Math.sin(angle)*11;const tube=new THREE.Mesh(new THREE.CylinderGeometry(1,1.2,3,7),this.material(1,3,'#8fa991'));tube.position.set(px,y+1.5,pz);this.group.add(tube);this.box(px,y+.4,pz,4,.8,4,2,0);}
  }else if(kind==='turbine'){
   for(const dx of[-12,12]){const tube=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,5,12),this.material(3,1,'#adcbd5'));tube.rotation.z=Math.PI/2;tube.position.set(x+dx,y+2,z-4);this.group.add(tube);this.box(x+dx,y+1,z-4,7,2,5,3,0);}
  }else{
   const core=new THREE.Mesh(new THREE.CylinderGeometry(2,2.2,3.5,8),this.material(3,3,'#ffc787'));core.position.set(x,y+1.75,z-6);this.group.add(core);
   for(let i=0;i<3;i++){const hoop=new THREE.Mesh(new THREE.TorusGeometry(5,.24,5,12),this.material(1,1));hoop.position.set(x,y+.7+i*1.2,z-6);hoop.rotation.x=Math.PI/2;this.group.add(hoop);this.animated.push(hoop);}
  }
 }
 update(dt){this.age+=dt;for(const{mesh,row}of this.motion)mesh.material.map=this.atlas.texture(this.atlas.frame('stationMotion',Math.floor(this.age*7)%8,row));for(const{data,mesh}of this.lifts)mesh.position.y=data.y-.2;for(const{data,mesh}of this.gates)mesh.position.y=data.y+1.8+data.amount*3.8;for(const{data,lamp}of this.switches)lamp.material.color.set(data.on?'#85f3aa':'#eead68');this.card.visible=!this.world.accessCard.taken;for(const mesh of this.animated)mesh.rotation.z+=dt*.12;}
 dispose(){this.group.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});}
}
