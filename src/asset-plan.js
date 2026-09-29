import {SPECS,THEMES} from './atlas.js';
import {ACTORS,WEAPONS} from './catalog.js';
import {INTRODUCTIONS} from './encounters.js';
import {CHAPTERS} from './campaign.js';

export const TITLE_ASSETS=['hudSkin'];
// Every asset a chapter can use is decoded before simulation begins. Other
// station themes and absent players' walk/weapon sheets stay on disk.
export function missionAssets(chapter=0,pilots=[],extraActors=[]){
 const theme=THEMES[CHAPTERS[chapter%CHAPTERS.length].theme].id;
 return Object.keys(SPECS).filter(id=>{
  if(id.startsWith('crew-'))return pilots.some(p=>WEAPONS.some(w=>id===`crew-${p}-${w.id}`));
  if(id.startsWith('env-')||id.startsWith('dressing-'))return id===`env-${theme}`||id===`env-extra-${theme}`||id===`dressing-${theme}`;
  if(ACTORS[id])return (INTRODUCTIONS[id]??0)<=chapter||extraActors.includes(id);
  return true;
 });
}
