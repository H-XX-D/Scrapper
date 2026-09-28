import{PAD,MenuRepeat}from'./controller.js';
// Focus the existing menu, retaining its original artwork and layout.
export class ControllerMenu{
 constructor(){this.repeat=new MenuRepeat();this.root=null;this.edit=null;}
 focus(element){document.querySelectorAll('.controller-focus').forEach(e=>e.classList.remove('controller-focus'));if(!element)return;element.classList.add('controller-focus');element.focus({preventScroll:true});element.scrollIntoView({block:'nearest'});}
 clear(){document.querySelectorAll('.controller-focus').forEach(e=>e.classList.remove('controller-focus'));this.cancelEdit();this.root=null;}
 cancelEdit(){if(this.edit){this.edit.element.value=this.edit.original;this.edit.element.classList.remove('controller-edit');this.edit=null;}}
 update(root,state,dt,back){
  if(this.root!==root){this.clear();this.root=root;this.repeat=new MenuRepeat();}
  const items=[...root.querySelectorAll('button,summary,select,input:not([type=file])')].filter(e=>!e.disabled&&!e.hidden&&e.getClientRects().length);
  let current=document.activeElement;if(!items.includes(current)){current=items[0];if(state.active)this.focus(current);}if(!current)return;
  if(state.active&&!current.classList.contains('controller-focus'))this.focus(current);
  const h=state.held,p=state.pressed,direction=h[PAD.up]||state.move.y<-.55?'up':h[PAD.down]||state.move.y>.55?'down':h[PAD.left]||state.move.x<-.55?'left':h[PAD.right]||state.move.x>.55?'right':'';
  const step=this.repeat.tick(direction,dt);
  if(this.edit){
   const e=this.edit,chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
   if(step==='left'||step==='right')e.cursor=(e.cursor+(step==='right'?1:5))%6;
   if(step==='up'||step==='down'){const text=e.element.value.padEnd(6,'A').slice(0,6).split(''),index=chars.indexOf(text[e.cursor]);text[e.cursor]=chars[(index+(step==='up'?1:chars.length-1)+chars.length)%chars.length];e.element.value=text.join('');}
   e.element.setSelectionRange(e.cursor,e.cursor+1);
   if(p[PAD.jump]){e.element.classList.remove('controller-edit');e.element.dispatchEvent(new Event('input',{bubbles:true}));this.edit=null;}
   else if(p[PAD.wipe])this.cancelEdit();return;
  }
  if(p[PAD.wipe]){const details=current.closest('details[open]');if(details){details.open=false;this.focus(details.querySelector('summary'));}else back();return;}
  if(step==='up'||step==='down'){const index=items.indexOf(current);this.focus(items[(index+(step==='down'?1:items.length-1))%items.length]);}
  if(step==='left'||step==='right'){
   const amount=step==='right'?1:-1;
   if(current.tagName==='SELECT'){current.selectedIndex=Math.max(0,Math.min(current.options.length-1,current.selectedIndex+amount));current.dispatchEvent(new Event('change',{bubbles:true}));}
   else if(current.type==='range'||current.type==='number'){amount>0?current.stepUp():current.stepDown();current.dispatchEvent(new Event('input',{bubbles:true}));current.dispatchEvent(new Event('change',{bubbles:true}));}
   else if(current.tagName==='SUMMARY'){current.parentElement.open=amount>0;}
  }
  if(p[PAD.jump]){
   if(current.id==='room-input'){this.edit={element:current,original:current.value,cursor:0};current.value=current.value.toUpperCase().padEnd(6,'A').slice(0,6);current.classList.add('controller-edit');current.setSelectionRange(0,1);}
   else if(current.tagName==='SELECT'){current.selectedIndex=(current.selectedIndex+1)%current.options.length;current.dispatchEvent(new Event('change',{bubbles:true}));}
   else if(current.type!=='range'&&current.type!=='number')current.click();
  }
  if(Math.abs(state.look.y)>.2){const scroll=root.querySelector('.dialog')||root;scroll.scrollTop+=state.look.y*480*dt;}
 }
}
