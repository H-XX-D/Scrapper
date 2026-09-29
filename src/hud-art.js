// Reuse the original painted steel rather than introducing a second UI theme.
export function installChrome(atlas){
 const skin=atlas.images.hudSkin,c=document.createElement('canvas');c.width=320;c.height=190;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(skin,1034,744,319,190,0,0,320,190);
 document.documentElement.style.setProperty('--steel-panel',`url("${c.toDataURL()}")`);
 const strip=document.createElement('canvas');strip.width=340;strip.height=52;const g=strip.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(skin,680,856,340,78,0,0,340,52);document.documentElement.style.setProperty('--steel-button',`url("${strip.toDataURL()}")`);
}
export function helmetPortrait(ctx,skin,width,height,time=0,talking=false){
 ctx.clearRect(0,0,width,height);ctx.imageSmoothingEnabled=false;const bob=talking?Math.floor(Math.sin(time*10)*1.5):0;ctx.drawImage(skin,520,774,119,124,0,bob,width,height);
 if(talking){ctx.fillStyle='#9bdde2';for(let i=0;i<5;i++){const h=2+Math.abs(Math.sin(time*15+i))*8;ctx.fillRect(width*.29+i*width*.09,height*.85-h,width*.05,h);}}
}
export function drawDashboard(ctx,atlas,width,height,arsenal,player,state={}){
 const skin=atlas.images.hudSkin,h=Math.min(height*.28,width*207/1672),scale=h/207,w=1672*scale,left=(width-w)/2,top=height-h;
 document.documentElement.style.setProperty('--hud-height',h+'px');
 ctx.fillStyle='#17252b';ctx.fillRect(0,top,width,h);ctx.drawImage(skin,0,734,1672,207,left,top,w,h);
 ctx.save();ctx.translate(left,top);ctx.scale(scale,scale);ctx.textAlign='center';ctx.textBaseline='middle';
 const text=(value,x,y,size=16,color='#f3dfaf')=>{ctx.font=`${size}px Pixel`;ctx.fillStyle='#03080c';ctx.fillText(String(value),x+2,y+2);ctx.fillStyle=color;ctx.fillText(String(value),x,y);};
 const total=Object.values(arsenal.slots).reduce((sum,s)=>sum+(s.owned?s.reserve+s.mag:0),0),slot=arsenal.slots[arsenal.selected];
 function gauge(cx,value,fraction,label){fraction=Math.max(0,Math.min(1,fraction||0));for(let i=0;i<16;i++){const a=Math.PI+(i+.5)/16*Math.PI;ctx.strokeStyle=i/16<fraction?(i<3?'#cf6236':'#f3a544'):'#26343a';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*73,139+Math.sin(a)*73);ctx.lineTo(cx+Math.cos(a)*83,139+Math.sin(a)*83);ctx.stroke();}
  const a=Math.PI+Math.min(1,fraction)*Math.PI;ctx.strokeStyle='#ffbd67';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx,139);ctx.lineTo(cx+Math.cos(a)*59,139+Math.sin(a)*59);ctx.stroke();text(label,cx,111,14);text(String(Math.max(0,value)).padStart(3,'0'),cx,162,27,'#fff0c2');}
 gauge(144,total,Math.min(1,total/350),'TOTAL AMMO');gauge(376,slot.mag,slot.mag/state.capacity,'GUN AMMO');
 // The helmet now belongs to the speaking dropdown. Its old monitor becomes the access-card slot.
 ctx.drawImage(skin,1080,795,240,90,519,41,126,125);text('ACCESS',582,64,11);ctx.fillStyle=state.key?'#66bde7':'#263d4b';ctx.fillRect(557,84,50,30);ctx.fillStyle=state.key?'#d6ecdf':'#46616e';ctx.fillRect(564,91,12,12);ctx.fillRect(584,91,16,3);ctx.fillRect(584,98,16,3);text(state.key?'BLUE':'—',582,135,12,state.key?'#92d9f1':'#7a9296');
 text('SCRAP / SCORE',891,65,15);text(String(state.score||0).padStart(6,'0'),897,111,26,'#ffe6b0');
 text(state.weaponName||arsenal.selected,1204,63,12);const selected=Object.keys(arsenal.slots).indexOf(arsenal.selected);ctx.drawImage(atlas.frame('pickups',selected,0),1090,77,230,79);
 // Reuse the ammo dial's actual painted housing at the same native size.
 ctx.drawImage(skin,20,766,240,148,1393,32,240,148);
 gauge(1513,Math.ceil(Math.max(0,Math.min(100,player.hp))),Math.max(0,Math.min(1,player.hp/100)),'HEALTH');text('SECRETS '+(state.secrets||0)+' / 2',891,156,11);ctx.restore();
 const cw=Math.min(660,width*.52);ctx.drawImage(skin,486,0,703,58,width/2-cw/2,10,cw,cw*58/703);
}
