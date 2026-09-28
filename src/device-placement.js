// Keep the interaction/navigation point in front of the solid device. This
// preserves existing saves and puzzle coordinates while matching the artwork.
export function installDeviceBodies(world,nodes){
 for(const n of nodes){if(n.plate||n.kind==='coupler')continue;
  let body;for(const [nx,nz]of[[0,1],[1,0],[0,-1],[-1,0]]){const x=n.x-nx*.95,z=n.z-nz*.95;if(world.canMove(x,z,.45,n.y)&&Math.abs((world.floor(x,z,n.y)??-99)-n.y)<.12){body={x,z,y:n.y,w:nx?.7:1.3,d:nx?1.3:.7,h:2.1,nx,nz,device:n.id};break;}}
  if(body){n.body=body;world.obstacles.push(body);}
 }
 world.invalidateRoutes?.();
}
