// Presentation only; hits, weapon cadence, damage and network authority are unchanged.
export const PLAYER_SHOTS={
 bolt:{row:0,size:.48,speed:65,color:'#8fe4e5',strength:8},
 arc:{row:1,size:.9,speed:44,color:'#b195ff',strength:18},
 beam:{row:3,size:.68,speed:95,color:'#efbd62',strength:12},
 rockets:{row:4,size:.8,speed:38,color:'#ff983f',strength:13},
 frost:{row:5,size:.64,speed:52,color:'#8be4f1',strength:9},
 blades:{row:6,size:.75,speed:58,color:'#c5a2ff',strength:7},
 flame:{row:7,size:.7,speed:22,color:'#ffa83c',strength:11}
};
export function shotLight(effect){const d=PLAYER_SHOTS[effect.gun];if(!d)return null;return{x:effect.mesh.position.x,y:effect.mesh.position.y,z:effect.mesh.position.z,color:d.color,strength:d.strength*(.82+.18*Math.sin(effect.age*71)),radius:effect.gun==='arc'?13:9,kind:'player-'+effect.gun};}

// 0 = viewed from the exhaust, 4 = right profile, 8 = nose-on,
// 12 = left profile. Each observer resolves the same world-space trajectory.
export function projectileDirection(from,to,position,viewer){
 const dx=to.x-from.x,dz=to.z-from.z,length=Math.hypot(dx,dz);
 if(length<1e-6)return 0;
 const vx=viewer.x-position.x,vz=viewer.z-position.z;
 const forward=(dx*vx+dz*vz)/length,right=(-dz*vx+dx*vz)/length;
 return Math.round(((Math.atan2(right,-forward)+Math.PI*2)%(Math.PI*2))/(Math.PI/8))%16;
}
export function directionalFrame(gun,direction,age=0){
 const phase=Math.floor(age*18)%4;
 // Rigid casing has ONE canonical image per view. Only the separate flame
 // animates, so the silver cone can never morph during a rocket's flight.
 if(gun==='rockets')return{sheet:'projectile-rockets',col:direction%4,row:Math.floor(direction/4),phase:0,direction};
 if(gun==='flame'||gun==='beam')return{sheet:gun==='flame'?'projectile-fireballs':'projectile-prism',col:direction%8,row:phase*2+Math.floor(direction/8),phase,direction};
 return{sheet:'player-projectiles',col:Math.floor(age*18)%8,row:PLAYER_SHOTS[gun].row,phase,direction};
}
