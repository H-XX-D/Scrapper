(()=>{
 const g=scrapper,out={frames:[],errors:[]};g.pause();
 for(const [id,columns,rows]of[['projectile-rockets',4,4],['projectile-fireballs',8,8],['projectile-prism',8,8],['clinger-pods',8,4]])for(let r=0;r<rows;r++)for(let c=0;c<columns;c++){
  const image=g.artFrame(id,c,r),data=image.getContext('2d').getImageData(0,0,image.width,image.height).data;let opaque=0,edge=0;
  for(let i=0;i<data.length;i+=4)if(data[i+3]>55){opaque++;const x=i/4%image.width,y=Math.floor(i/4/image.width);if(x<3||y<3||x>=image.width-3||y>=image.height-3)edge++;}
  const frame={id,c,r,opaque,edge};out.frames.push(frame);if(opaque<100||edge)out.errors.push(frame);
 }
 const grid=document.createElement('div');grid.id='art-audit';grid.style.cssText='position:relative;z-index:99999;display:grid;grid-template-columns:repeat(8,128px);gap:8px;width:1080px;background:#15242d;color:white;padding:20px;font:11px monospace';
 for(const [id,columns]of[['projectile-rockets',4],['projectile-fireballs',8],['projectile-prism',8]])for(let angle=0;angle<16;angle++){
  const item=document.createElement('div'),canvas=document.createElement('canvas');canvas.width=128;canvas.height=112;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(g.artFrame(id,angle%columns,Math.floor(angle/columns)),0,0,128,112);item.append(canvas,document.createTextNode(id.replace('projectile-','')+' '+angle*22.5+'°'));grid.append(item);
 }
 for(const el of document.body.children)el.style.display='none';document.body.style.cssText='overflow:auto;height:auto;background:#15242d';document.body.append(grid);return out;
})()
