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
