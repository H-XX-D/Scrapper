// Room identities are stable for encounters and saves; their arrangement and connections are not.
// Coordinates are in two-metre cells. Every profile retains a low ceiling and a gated final bay.
const ids=['arrival','hall','west','east','upper','cross','armory','lock','boss'];
const names=['RECOVERY DOCK','TRANSFER WORKS','SERVICE BANK','PROCESSING','UPPER WORKS','CONTROL','STORES','BULKHEAD','GUARDIAN BAY'];
const profiles=[
 ['Freight switchback',[[0,66],[0,47],[-23,45],[24,51],[-25,17],[0,21],[26,25],[0,0],[0,-20]],'ah hw we eu uc ce ea cl lb',0],
 ['Split archive',[[47,58],[21,43],[-23,38],[45,27],[-25,10],[0,15],[27,-1],[-24,-14],[-24,-36]],'ah hw hc wu uc ce ea ac cl lb',1],
 ['Pump horseshoe',[[-40,49],[-13,34],[-40,18],[15,37],[-41,-11],[-13,2],[16,9],[18,-18],[42,-18]],'aw wh he ea ac cu uw hc ul cl lb',2],
 ['Foundry braid',[[27,66],[2,46],[-24,40],[29,43],[-25,12],[0,18],[29,13],[1,-7],[1,-29]],'ae eh hw wu uc ca ea hc cl lb',3],
 ['Bonded cargo loops',[[-28,64],[0,47],[-28,31],[29,35],[-30,2],[0,15],[29,4],[-1,-10],[-26,-29]],'ah he ea ac cu uw wh hc ec cl lb',0],
 ['Relay descent',[[42,69],[15,52],[-14,38],[43,41],[-16,8],[13,21],[42,10],[16,-4],[42,-24]],'aw wh he ec cu uw ca ea cl lb',2],
 ['Habitat spokes',[[0,68],[0,46],[-30,35],[30,39],[-27,6],[0,16],[30,10],[0,-8],[0,-29]],'ah hw he hc wu uc ce ca ea ul cl lb',1],
 ['Assembly dogleg',[[-30,60],[-5,48],[-30,31],[24,36],[-31,3],[-4,7],[24,-1],[50,-1],[74,-1]],'aw wh hc wu uc ca he ea al cl lb',3],
 ['Broken dock bypass',[[-27,69],[0,50],[-28,43],[29,43],[-25,13],[1,21],[31,11],[0,-3],[0,-25]],'aw ah wh hc ce ea ac cu uw cl lb',0],
 ['Vault clusters',[[41,65],[13,49],[-40,34],[42,38],[-42,3],[-13,18],[15,17],[-42,-21],[-42,-43]],'ae eh hw wu uc ca ec ea ul cl lb',1],
 ['Backbone crossings',[[0,72],[0,51],[-28,43],[30,47],[-29,12],[0,20],[29,14],[0,-6],[0,-28]],'ah he ew wu uc ca ea hc al cl lb',2],
 ['Carrier shutdown',[[28,71],[-1,46],[-27,23],[28,49],[-26,-8],[0,-10],[26,-5],[26,20],[0,20]],'ae eh hw wu uc ca ea wc ul al lb',3]
];
const alias={a:'arrival',h:'hall',w:'west',e:'east',u:'upper',c:'cross',l:'lock',b:'boss'};
// 'a' at the end of an edge denotes the armory; an initial 'a' denotes arrival.
function edge(s){return[alias[s[0]],s[1]==='a'?'armory':alias[s[1]]];}
// Explicit armory exits, where the short notation would otherwise be ambiguous.
const armoryStarts=new Set(['ac','al']);
export const CHAPTER_LAYOUTS=profiles.map(([name,positions,edges,theme],index)=>({
 id:index,name,theme,positions,
 links:edges.split(' ').map(s=>armoryStarts.has(s)?['armory',alias[s[1]]]:edge(s)),
 shape:['loading','alcoves','channels','machine','racks','split','garden','machine','damaged','alcoves','channels','split'][index]
}));
export function chapterConfiguration(chapter,base){
 const p=CHAPTER_LAYOUTS[chapter%12];
 const deck=[0,0,0,0,3,3,3,3,3];
 if([2,5,10].includes(p.id)){deck[1]=-3;deck[2]=-3;deck[5]=-3;deck[6]=3;deck[7]=deck[8]=0;}
 if(p.id===5)deck[6]=0;
 if([3,7,11].includes(p.id)){deck[4]=3;deck[5]=3;deck[6]=6;deck[7]=deck[8]=6;}
 const sizes=[[11,9],[18,15],[12,13],[14,13],[12,10],[16,13],[12,12],[9,9],[21,16]];
 return {...base,name:p.name.toUpperCase(),profile:p,
  rooms:ids.map((id,i)=>{let[w,d]=sizes[i];if(i>0&&i<7){w+=(p.id+i)%3-1;d+=(p.id*2+i)%5-2;}const[x,z]=p.positions[i];return[id,names[i],(x+45)/.63,(z+35)/.63,w/.6,d/.6,deck[i]*2,3.8,i===5&&[1,6,9].includes(p.id)?'round':undefined];}),
  links:p.links,lift:['east','armory']
 };
}
