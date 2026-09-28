import{PILOTS,WEAPON_BY_ID}from'./catalog.js';
export const SAVE_VERSION=2,SAVE_KEY='scrapper-recovery-campaign-v2';
const finite=(v,low,high,fallback)=>Number.isFinite(v)?Math.max(low,Math.min(high,v)):fallback;
export function validateCampaignSave(value){
 if(!value||value.version!==SAVE_VERSION||!value.state||typeof value.state!=='object')return null;
 const raw=value.state,chapter=Math.floor(finite(raw.chapter,0,11,0)),seed=Math.floor(finite(raw.seed,1,2147483647,2709)),pilot=PILOTS[raw.pilot]?raw.pilot:'rook';
 if(!raw.player||!Number.isFinite(raw.player.x)||!Number.isFinite(raw.player.z))return null;
 const state={...raw,chapter,seed,pilot,score:Math.floor(finite(raw.score,0,1e9,0)),player:{...raw.player,hp:finite(raw.player.hp,1,100,100),yaw:finite(raw.player.yaw,-1e6,1e6,0),pitch:finite(raw.player.pitch,-1.25,1.25,0)}};
 state.arsenal={selected:WEAPON_BY_ID[raw.arsenal?.selected]?raw.arsenal.selected:'bolt',slots:{}};
 for(const[id,w]of Object.entries(WEAPON_BY_ID)){const s=raw.arsenal?.slots?.[id];state.arsenal.slots[id]={owned:id==='bolt'||s?.owned===true,mag:Math.floor(finite(s?.mag,0,w.mag,id==='bolt'?w.mag:0)),reserve:Math.floor(finite(s?.reserve,0,999,id==='bolt'?120:0))};}
 if(!state.arsenal.slots[state.arsenal.selected].owned)state.arsenal.selected='bolt';
 for(const key of ['actors','nests','cases','pickups','gates','switches','secrets','campaign'])state[key]=Array.isArray(raw[key])?raw[key].slice(0,key==='actors'?500:1000):[];
 return{version:SAVE_VERSION,label:String(value.label||'RECOVERY').slice(0,60),savedAt:String(value.savedAt||new Date().toISOString()),state};
}
export class CampaignStore{
 constructor(storage=globalThis.localStorage){this.storage=storage;}
 read(){try{const raw=JSON.parse(this.storage.getItem(SAVE_KEY)||'[]');return Array.from({length:3},(_,i)=>validateCampaignSave(raw[i]));}catch{return[null,null,null];}}
 save(slot,state,label='RECOVERY'){const slots=this.read(),record=validateCampaignSave({version:SAVE_VERSION,label,savedAt:new Date().toISOString(),state});if(!record)throw Error('Campaign state could not be saved.');slots[Math.max(0,Math.min(2,slot|0))]=record;this.storage.setItem(SAVE_KEY,JSON.stringify(slots));return record;}
 load(slot=0){return this.read()[slot|0]||null;}
 export(slot=0){const record=this.load(slot);if(!record)throw Error('This save slot is empty.');return JSON.stringify(record,null,2);}
 import(text,slot=0){if(text.length>8e6)throw Error('Save file is too large.');const record=validateCampaignSave(JSON.parse(text));if(!record)throw Error('This is not a Scrapper recovery save.');const slots=this.read();slots[Math.max(0,Math.min(2,slot|0))]=record;this.storage.setItem(SAVE_KEY,JSON.stringify(slots));return record;}
}
