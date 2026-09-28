(async()=>{
 const{Atlas,SPECS}=await import('/src/atlas.js'),{PILOTS,WEAPONS}=await import('/src/catalog.js'),{isSuitOrange}=await import('/src/suit-palette.js');
 const atlas=new Atlas();await Promise.all(Object.entries(SPECS).filter(([id])=>id.startsWith('reload-')||['wipe','splatter','coloredSplatter'].includes(id)).map(async([id,s])=>{const img=new Image();img.src='/'+s.path;await img.decode();atlas.images[id]=img;}));
 const data=c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data,checks=[];
 for(const id of [...WEAPONS.map(w=>'reload-'+w.id),'wipe'])for(let f=0;f<(id==='wipe'?4:12);f++){
  const col=f%4,row=Math.floor(f/4),base=data(atlas.frame(id,col,row,'rook'));let variants=0;
  for(const pilot of ['echo','flint','eos']){const d=data(atlas.frame(id,col,row,pilot));let changed=0,remainingOrange=0;
   for(let p=0;p<d.length;p+=4){if(d[p+3]!==base[p+3])throw Error('Alpha changed '+id+'/'+f);if(d[p]!==base[p]||d[p+1]!==base[p+1]||d[p+2]!==base[p+2]){changed++;if(!isSuitOrange(...base.slice(p,p+4)))throw Error('Non-orange pixel changed '+id+'/'+f);}if(isSuitOrange(...d.slice(p,p+4)))remainingOrange++;}
   if(changed<200)throw Error('Suit missing '+id+'/'+f+'/'+pilot);if(id==='wipe'&&remainingOrange)throw Error('Wipe still orange '+f+'/'+pilot);variants++;
  }checks.push({id,frame:f,variants});
 }
 const overview=document.createElement('canvas');overview.width=1400;overview.height=800;const x=overview.getContext('2d');x.fillStyle='#152129';x.fillRect(0,0,1400,800);x.imageSmoothingEnabled=false;
 Object.keys(PILOTS).forEach((pilot,p)=>{WEAPONS.forEach((w,i)=>{x.drawImage(atlas.frame('reload-'+w.id,0,0,pilot),i*200,p*200+20,200,178);});x.fillStyle='white';x.font='14px monospace';x.fillText(PILOTS[pilot].name,8,p*200+15);});
 window.suitOverview=overview.toDataURL();
 return{passed:true,frames:checks.length,pilotVariants:checks.length*3,alphaPreserved:true,onlyOrangePixelsChanged:true,originalWipeHasNoOrangeOnOtherPilots:true,checks};
})()
