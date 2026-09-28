// Subtract the actual openings on every deck. A neighbour on another floor is
// not an opening in this wall; stair edges are split into their four treads.
export function surfaceIndex(cells){const map=new Map();for(const c of cells){const key=c.x+','+c.z;if(!map.has(key))map.set(key,[]);map.get(key).push(c);}return map;}
export function treadHeight(c,x,z){if(!c.stair)return c.y;const s=c.stair,t=(((s.axis==='x'?x:z)/2)%1+1)%1,u=s.dir>0?t:1-t;return s.from+(s.to-s.from)*Math.ceil(u*4-1e-7)/4;}
export function wallSpans(c,dx,dz,index){const result=[],neighbours=index.get((c.x+dx)+','+(c.z+dz))||[];for(let i=0;i<4;i++){const offset=-.75+i*.5,x=c.x*2+1+dx+dz*offset,z=c.z*2+1+dz+dx*offset,lo=treadHeight(c,x-dx*.001,z-dz*.001);let spans=[[lo,c.ceiling]];for(const n of neighbours){const bottom=n.gap?(n.pit??-22):treadHeight(n,x+dx*.001,z+dz*.001),top=n.ceiling;spans=spans.flatMap(([a,b])=>top<=a||bottom>=b?[[a,b]]:[[a,Math.min(b,bottom)],[Math.max(a,top),b]].filter(([l,h])=>h-l>.005));}for(const [low,high]of spans)if(high-low>.005)result.push({x,z,low,high,width:.5});}return result;}
// One physical deck per height; do not emit duplicate coplanar surfaces.
export function uniqueCells(cells){const seen=new Set();return cells.filter(c=>{const key=[c.x,c.z,c.y.toFixed(4),c.stair?.from,c.stair?.to].join(':');if(seen.has(key))return false;seen.add(key);return c.ceiling>c.y+.05;});}
