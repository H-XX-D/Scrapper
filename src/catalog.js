export const ANIMATIONS={idle:{row:0,fps:6,loop:true},move:{row:1,fps:10,loop:true},tell:{row:2,fps:8},attack:{row:3,fps:12},altTell:{row:2,fps:8},altAttack:{row:3,fps:12},hurt:{row:4,fps:12},death:{row:5,fps:8}};
const enemy=(name,art,hp,speed,size,primary,alternate,extra={})=>({name,art,family:'ALIEN',tier:'ENEMY',hp,speed,size,range:5,windup:.8,recovery:1.1,damage:12,primary,alternate,color:'#b987dc',blood:'cyan',tell:'Its attack pose warns before it commits.',reaction:'Heavy hits interrupt attack preparation.',detail:name+' restored from the original Scrapper roster.',...extra});
export const ACTORS={
 facehugger:enemy('Visor Clinger','facehugger',32,4.2,1.1,'latch','latch',{range:6,windup:.7,recovery:1.5,damage:3,interruptible:true,blood:'green',parasite:true}),
 gnats:enemy('Static Gnats','gnats',40,3.8,1.6,'latch','latch',{range:5,windup:.6,recovery:1.4,damage:3,hover:.65,blood:'cyan',parasite:true}),
 burrower:enemy('Suit Burrower','burrower',28,3.8,.9,'latch','latch',{range:3.5,windup:.85,recovery:1.5,damage:4,interruptible:true,blood:'amber',parasite:true}),
 beetle:enemy('Void Beetle','beetle',55,2.8,1.7,'bite','leap',{interruptible:true}),
 crawler:enemy('Spore Crawler','crawler',35,4.2,1.35,'leap','bite',{blood:'amber',interruptible:true}),
 drone:enemy('Rogue Sentinel','drone',90,2,1.65,'bolts','rail',{family:'MACHINE',blood:'oil',range:18,hover:.45,color:'#78d9e5'}),
 tank:enemy('Carapace Brute','tank',190,1.3,2.5,'cleave','slam',{armor:true,damage:22,windup:1,recovery:1.6,blood:'green'}),
 splitter:enemy('Hive Pod','crawler',95,1.5,2,'orb','bite',{range:13,blood:'amber',splits:true}),
 lancer:enemy('Rift Lancer','crawler',80,2.4,1.7,'charge','leap',{range:14,blood:'amber',windup:1.05}),
 spitter:enemy('Acid Spitter','beetle',95,1.5,2,'acid','orb',{range:17,ranged:true,windup:1.05,recovery:1.45,blood:'green'}),
 bomber:enemy('Cinder Bomber','drone',45,3.6,1.5,'detonate','detonate',{range:3.2,blood:'amber',color:'#e79f55',damage:28,windup:1.1}),
 warden:enemy('Void Warden','tank',160,1.25,2.45,'summon','cleave',{range:16,blood:'violet',recovery:2}),
 leech:enemy('Phase Leech','crawler',35,5,1.25,'leap','bite',{flanker:true,interruptible:true,blood:'violet'}),
 shardling:enemy('Shardling','beetle',22,5.2,.95,'bite','leap',{interruptible:true,blood:'violet',range:3}),
 jelly:enemy('Volt Medusa','jelly',105,1.8,2,'radial','orb',{range:16,hover:.7,color:'#76e5ef',blood:'cyan'}),
 scorpion:enemy('Rust Scorpion','scorpion',155,2.2,2.35,'charge','cleave',{range:12,damage:22,color:'#e69d60',blood:'amber'}),
 priest:enemy('Spore Oracle','priest',125,1.4,2.15,'heal','fan',{range:18,interruptible:true,blood:'violet'}),
 bat:enemy('Eclipse Bat','bat',45,5.7,1.7,'leap','bite',{flanker:true,hover:.8,interruptible:true,blood:'violet'}),
 worm:enemy('Bile Worm','worm',95,2.2,2.05,'acid','orb',{range:15,ranged:true,blood:'green'}),
 spider:enemy('Siege Arachnid','spider',180,1.5,2.5,'cannon','crossfire',{family:'MACHINE',range:20,ranged:true,damage:17,windup:1.1,blood:'oil'}),
 guardian:enemy('Hatch Warden','boss0',620,1.65,3.4,'charge','slam',{tier:'MINIBOSS',range:20,windup:1.2,recovery:2,damage:25,blood:'amber',color:'#e4a75a'}),
 marshal:enemy('Choir Marshal','boss1',540,1.15,3.3,'fan','summon',{tier:'MINIBOSS',range:20,windup:1.2,recovery:1.8,damage:14,blood:'violet',color:'#a7c679'}),
 matriarch:enemy('The Matriarch','boss0',1100,1.05,3.9,'broodFan','brood',{tier:'BOSS',range:24,windup:1.25,recovery:2,damage:15,blood:'amber',color:'#e9ac65'}),
 parallax:enemy('Parallax','boss4',1000,1.3,3.8,'rail','crossfire',{tier:'BOSS',family:'MACHINE',range:27,windup:1.5,recovery:2.1,damage:27,blood:'oil',color:'#79d5e6'}),
 overseer:enemy('Eclipse Overseer','overseer',1050,1.1,3.5,'crossfire','radial',{tier:'BOSS',range:25,windup:1.3,recovery:2,damage:19,blood:'violet',hover:.5,color:'#ad91e2'})
};
for(const[id,def]of Object.entries(ACTORS)){def.id=id;def.asset=def.art.startsWith('boss')?'assets/legacy/boss-motion-keyed.png':`assets/generated/original-${def.art}.png`;def.cols=def.art.startsWith('boss')?4:6;def.rows=6;}
for(const id of ['facehugger','gnats','burrower']){ACTORS[id].asset='assets/generated/'+id+'-v10.png';ACTORS[id].cols=8;}
export const PILOTS={rook:{name:'Rook',row:0,color:'#ee913c',hue:30},echo:{name:'Echo',row:1,color:'#b995e3',hue:276},flint:{name:'Flint',row:2,color:'#69bbaa',hue:166},eos:{name:'EOS',row:3,color:'#85deef',hue:188}};
export const SPEAKERS={ROOK:{name:'Rook',row:0,color:'#e9a05c',role:'SCRAPPER'},ECHO:{name:'Echo',row:1,color:'#c0a0e5',role:'SIGNAL / RECON'},FLINT:{name:'Flint',row:2,color:'#78c7b8',role:'ENGINEERING'},EOS:{name:'EOS',row:3,color:'#7ecfdf',role:'MISSION CONTROL'}};
export const WEAPONS=[
 {id:'bolt',name:'ION CARBINE',short:'ION',ammoName:'Ion magazines',damage:25,delay:.16,mag:24,reserve:120,reload:1.6,color:'#8fe4e5',mode:'bullet'},
 {id:'arc',name:'ARC RELAY',short:'ARC',ammoName:'Capacitors',damage:37,delay:.4,mag:12,reserve:48,reload:2,color:'#c490ee',mode:'chain'},
 {id:'beam',name:'PRISM BEAM',short:'PRISM',ammoName:'Prism cells',damage:88,delay:.72,mag:6,reserve:24,reload:2.2,color:'#efbd62',mode:'pierce'},
 {id:'rockets',name:'COMET RACK',short:'COMET',ammoName:'Rockets',damage:120,delay:.8,mag:3,reserve:18,reload:2.8,color:'#ed9957',mode:'blast'},
 {id:'frost',name:'CRYO SPINDLE',short:'CRYO',ammoName:'Cryo canisters',damage:20,delay:.19,mag:30,reserve:90,reload:1.9,color:'#8be4f1',mode:'freeze'},
 {id:'blades',name:'MOON BLADES',short:'MOON',ammoName:'Crescent discs',damage:54,delay:.4,mag:8,reserve:40,reload:2.15,color:'#dc93ef',mode:'pierce'},
 {id:'flame',name:'SOLAR TORCH',short:'SOLAR',ammoName:'Fuel',damage:14,delay:.08,mag:60,reserve:180,reload:2.45,color:'#fdb165',mode:'flame',range:9}
];
export const WEAPON_BY_ID=Object.fromEntries(WEAPONS.map((w,index)=>[w.id,{...w,index}]));
export function animationFrame(state,age,duration){const def=ANIMATIONS[state]||ANIMATIONS.idle;const frame=duration?Math.min(7,Math.floor(Math.max(0,age)/Math.max(.001,duration)*8)):def.loop?Math.floor(Math.max(0,age)*def.fps)%8:Math.min(7,Math.floor(Math.max(0,age)*def.fps));return{row:def.row,col:frame};}
