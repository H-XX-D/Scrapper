export function initialMission(){return{power:null,record:false,complete:false,nestsDestroyed:0,choices:[],purged:false};}
export function applyDecision(state,id,value){
 if(id==='power'&&!state.power&&['armory','maintenance'].includes(value)){state.power=value;state.choices.push({id,value});return{accepted:true,message:value==='armory'?'Armory unlocked. Its Comet Rack supply case is available.':'Maintenance bridge extended. A safe route is open.'};}
 if(id==='purge'&&!state.choices.some(c=>c.id==='purge')&&['purge','preserve'].includes(value)){state.purged=value==='purge';state.purgeBeforeRecord=state.purged&&!state.record;state.choices.push({id,value});return{accepted:true,message:state.purged?'Infestation purge confirmed. Research lost; brood pressure reduced.':'Research preserved. Surviving nests remain active.'};}
 return{accepted:false,message:'That decision is no longer available.'};
}
export class Radio{
 constructor(){this.queue=[];this.active=null;this.history=[];this.elapsed=0;this.selected=0;this.dismissed=false;this.seen=new Set();}
 send(message){if(this.seen.has(message.id))return false;this.seen.add(message.id);
  // Only a decision interrupts. Interrupted field logs resume instead of vanishing.
  if(message.choices){if(this.active&&!this.active.choices){this.queue.unshift({...this.active,resumeElapsed:this.elapsed});this.active=null;}this.queue.unshift({...message});}else this.queue.push({...message});
  this.advance();return true;
 }
 advance(){if(this.active||!this.queue.length)return;this.active=this.queue.shift();this.elapsed=this.active.resumeElapsed||0;delete this.active.resumeElapsed;this.selected=0;this.dismissed=false;if(!this.history.some(m=>m.id===this.active.id))this.history.push({...this.active});}

 update(dt){if(!this.active){this.advance();return;}this.elapsed+=dt;if(!this.active.choices&&this.elapsed>Math.max(7,this.active.text.length/27+3)){this.active=null;this.advance();}}
 visibleText(){return this.active?.text.slice(0,Math.floor(this.elapsed*38))||'';}
 finishText(){if(this.active)this.elapsed=Math.max(this.elapsed,this.active.text.length/38);}
 choose(index,state){const message=this.active,option=message?.choices?.[index];if(!option)return{accepted:false};const result=applyDecision(state,message.decision,option.value);if(result.accepted){this.active=null;this.advance();}return result;}
 toggle(){this.dismissed=!this.dismissed;}
}
export const BRIEF={id:'brief',speaker:'EOS',text:'Scrapper, this transit sector is contaminated. Recover the access record at control, then reach the northern lift. Nests feed the infestation. Your route is yours.'};
export const POWER={id:'power',speaker:'FLINT',decision:'power',text:'POWER ROUTING',choices:[{value:'armory',label:'ARMORY',effect:'Weapon case unlocked. Gap stays open.'},{value:'maintenance',label:'MAINTENANCE',effect:'Bridge restored. Armory stays sealed.'}]};
export const PURGE={id:'purge',speaker:'ECHO',decision:'purge',text:'ARCHIVE CONTROL',choices:[{value:'purge',label:'PURGE',effect:'Rupture nests. Lose research.'},{value:'preserve',label:'PRESERVE',effect:'Keep research. Nests stay active.'}]};
