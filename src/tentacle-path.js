export const MAX_TENTACLE_LENGTH=30;
export function tentacleSpan(world,p){
 const dx=p.nx||0,dy=p.ny||0,dz=p.nz||0,len=Math.hypot(dx,dy,dz);if(!len||!world.blocked)return null;
 const n={x:dx/len,y:dy/len,z:dz/len};let length=.12;
 for(let d=.25;d<=MAX_TENTACLE_LENGTH;d+=.25){if(world.blocked(p.x+n.x*d,p.y+n.y*d,p.z+n.z*d))break;length=d;}
 return{x:p.x+n.x*length,y:p.y+n.y*length,z:p.z+n.z*length,length};
}
// Closest distance between two finite segments, including parallel/zero-length cases.
export function segmentDistance(a,b,c,d){const sub=(p,q)=>({x:p.x-q.x,y:p.y-q.y,z:p.z-q.z}),dot=(p,q)=>p.x*q.x+p.y*q.y+p.z*q.z,clamp=v=>Math.max(0,Math.min(1,v));const u=sub(b,a),v=sub(d,c),w=sub(a,c),A=dot(u,u),B=dot(u,v),C=dot(v,v),D=dot(u,w),E=dot(v,w);let s=0,t=0;if(A<1e-10)t=C>0?clamp(E/C):0;else if(C<1e-10)s=clamp(-D/A);else{const den=A*C-B*B;s=den>1e-10?clamp((B*E-C*D)/den):0;t=(B*s+E)/C;if(t<0){t=0;s=clamp(-D/A);}else if(t>1){t=1;s=clamp((B-D)/A);}}return Math.hypot(w.x+u.x*s-v.x*t,w.y+u.y*s-v.y*t,w.z+u.z*s-v.z*t);}
export function crossesTentacle(p,player,padding=.85){if(!p.span)return Math.hypot(player.x-p.x,player.z-p.z,player.y+.9-p.y)<p.reach;const t=Math.min(1,(p.extension??p.span.length)/Math.max(.1,p.span.length)),end={x:p.x+(p.span.x-p.x)*t,y:p.y+(p.span.y-p.y)*t,z:p.z+(p.span.z-p.z)*t},now={x:player.x,y:player.y+1,z:player.z},previous=player.tentaclePrevious||now;if(Math.hypot(now.x-previous.x,now.y-previous.y,now.z-previous.z)>3)return segmentDistance(now,now,p,end)<padding;return segmentDistance(previous,now,p,end)<padding;}
export function dragCaptive(world,player,patch,dt){const dx=patch.x-player.x,dz=patch.z-player.z,l=Math.hypot(dx,dz);if(l<1.35||!world.canMove)return;const length=Math.min(l-1.35,dt*(.8+(player.grab?.strength||1))),steps=Math.max(1,Math.ceil(length/.1));for(let i=0;i<steps;i++){const x=player.x+dx/l*length/steps,z=player.z+dz/l*length/steps,f=world.floor(x,z,player.y);if(f===null||Math.abs(f-player.y)>.45||!world.canMove(x,z,.34,player.y))break;Object.assign(player,{x,z,y:f,vy:0,grounded:true});}}
