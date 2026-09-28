const bottoms=new WeakMap();
export function viewmodelBounds(frame,width,height,bob=0,recoil=0){let bottom=bottoms.get(frame);if(bottom===undefined){const d=frame.getContext('2d').getImageData(0,0,frame.width,frame.height).data;bottom=frame.height-1;outer:for(;bottom>0;bottom--)for(let x=0;x<frame.width;x++)if(d[(bottom*frame.width+x)*4+3]>100)break outer;bottom=(bottom+1)/frame.height;bottoms.set(frame,bottom);}
 const hud=Math.min(height*.28,width*207/1672),baseline=height-hud+Math.max(10,height*.025),h=Math.min((baseline-height*.5)/Math.max(.4,bottom-.09),width*.68*frame.height/frame.width),w=h*frame.width/frame.height;
 return{x:(width-w)/2,y:baseline-h*bottom+Math.sin(bob)*2+recoil*9,width:w,height:h,bottom:baseline};
}
