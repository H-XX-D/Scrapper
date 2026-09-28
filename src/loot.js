// Independent rolls: a kill can drop scrap, health, both, or neither.
export function rollLoot(random,tier='ENEMY'){
 const drops=[],bonus=tier==='BOSS'?4:tier==='MINIBOSS'?2:1;
 if(random()<.7)drops.push({kind:'scrap',amount:(10+Math.floor(random()*5)*5)*bonus});
 if(random()<.24)drops.push({kind:'health',amount:25});
 if(random()<.28)drops.push({kind:'ammo'});
 return drops;
}
export function nextOwnedWeapon(arsenal,direction){const owned=Object.keys(arsenal.slots).filter(id=>arsenal.slots[id].owned);const index=owned.indexOf(arsenal.selected);return owned[(index+(direction>0?1:-1)+owned.length)%owned.length];}
