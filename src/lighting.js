import * as THREE from '../vendor/three.module.js';
// A fixed pool keeps the shader/light count stable even during four-player firefights.
export class CombatLights{
 constructor(scene){scene.add(new THREE.HemisphereLight('#c2d9e3','#444050',1.35));this.lights=Array.from({length:10},()=>{const light=new THREE.PointLight('#ffffff',0,16,1.6);scene.add(light);return{light,age:0,life:0,strength:0,kind:'flash'};});}
 flash(position,color='#a5eeff',strength=9,life=.16,radius=15){const pool=this.lights.slice(0,5),item=pool.find(x=>x.age>=x.life)||pool.reduce((a,b)=>a.age/a.life>b.age/b.life?a:b);Object.assign(item,{age:0,life,strength,kind:'flash'});item.light.position.set(position.x,position.y,position.z);item.light.color.set(color);item.light.distance=35;item.light.intensity=strength;}
 update(dt,projectiles=[],sources=[],viewer={x:0,y:0,z:0}){
  for(const item of this.lights){item.age+=dt;item.light.intensity=item.age<item.life?item.strength*(1-item.age/item.life):0;}
  const visible=[...sources,...projectiles.map(p=>({...p,strength:6,radius:10,kind:'projectile'}))].sort((a,b)=>Math.hypot(a.x-viewer.x,a.y-viewer.y,a.z-viewer.z)/(a.strength||6)-Math.hypot(b.x-viewer.x,b.y-viewer.y,b.z-viewer.z)/(b.strength||6));
  for(let i=0;i<Math.min(5,visible.length);i++){const p=visible[i],item=this.lights[i+5];item.light.position.set(p.x,p.y,p.z);item.light.color.set(p.color);item.light.intensity=p.strength||6;item.light.distance=35;item.kind=p.kind;}
 }
 snapshot(){return this.lights.filter(x=>x.light.intensity>.01).map(x=>({color:x.light.color.getHexString(),intensity:x.light.intensity,kind:x.kind,reach:x.light.distance}));}
}
