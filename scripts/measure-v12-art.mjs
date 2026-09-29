import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
// Measure alpha gutters only; keep the generated source PNGs unchanged.
const layouts={};
for(const[id,cols,rows]of[['projectile-rockets',4,4],['projectile-fireballs',8,8],['projectile-prism',8,8],['clinger-pods',8,4]]){
 const{data,info:{width:w,height:h}}=await sharp(`assets/generated/${id}-v12.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const cuts=(n,length,count)=>{const out=[0];for(let i=1;i<n;i++){const start=Math.round((i-.32)*length/n),end=Math.round((i+.32)*length/n);let best=start,score=Infinity;for(let p=start;p<=end;p++){const v=count(p)+Math.abs(p-i*length/n)*.001;if(v<score){score=v;best=p;}}out.push(best);}out.push(length);return out;};
 const ys=cuts(rows,h,y=>{let n=0;for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>24)n++;return n;});
 const rects=[];let max=0;
 for(let row=0;row<rows;row++){
  const xs=cuts(cols,w,x=>{let n=0;for(let y=ys[row];y<ys[row+1];y++)if(data[(y*w+x)*4+3]>24)n++;return n;});
  const frames=[];
  for(let col=0;col<cols;col++){
   let x0=w,y0=h,x1=0,y1=0,count=0;
   for(let y=ys[row];y<ys[row+1];y++)for(let x=xs[col];x<xs[col+1];x++)if(data[(y*w+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);count++;}
   if(!count)throw Error(`Empty frame ${id}:${col},${row}`);
   const rect=[x0,y0,x1-x0+1,y1-y0+1];max=Math.max(max,rect[2],rect[3]);frames.push(rect);
  }rects.push(frames);
 }
 layouts[id]={cellSize:Math.ceil((max+20)/32)*32,rects};console.log(id,w,h,'cell',layouts[id].cellSize,'frames',cols*rows);
}
await writeFile('src/projectile-layouts.js','// Alpha bounds measured by scripts/measure-v12-art.mjs; source art preserved.\nexport const PROJECTILE_LAYOUTS='+JSON.stringify(layouts)+';\n');
