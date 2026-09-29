// Classic script chunks also work under file://, where separate images would
// taint the pixel-art canvases used for trimming, recoloring and HUD skins.
function readChunk(path){return new Promise((resolve,reject)=>{
 const callbacks=globalThis.__SCRAPPER_CHUNKS??=Object.create(null),script=document.createElement('script');let finished=false;
 const finish=(error,value)=>{if(finished)return;finished=true;clearTimeout(timer);delete callbacks[path];script.remove();error?reject(error):resolve(value);};
 const timer=setTimeout(()=>finish(Error('Art package timed out: '+path)),60000);
 callbacks[path]=value=>finish(null,value);script.onerror=()=>finish(Error('Unable to load '+path));script.onload=()=>{if(!finished)finish(Error('Invalid art package: '+path));};script.src=path;document.head.append(script);
});}
// A shared queue prevents overlapping chapter/lobby requests from decoding
// dozens of large PNGs simultaneously. Failed requests are retryable.
export class AssetLoader{
 constructor({concurrency=3,image=()=>new Image(),source=path=>{
  const value=globalThis.__SCRAPPER_ASSETS?.[path]||path;
  if(value.startsWith('#')){
   const payload=document.getElementById(value.slice(1));
   if(!payload)throw Error('Missing packed art: '+path);
   return payload.textContent.trim();
  }
  if(value.endsWith('.asset.js'))return readChunk(value);
  return value;
 }}={}){Object.assign(this,{concurrency,image,source});this.jobs=new Map();this.queue=[];this.active=0;this.peak=0;this.completed=0;}
 get(path){
  if(this.jobs.has(path))return this.jobs.get(path);
  const job=new Promise((resolve,reject)=>this.queue.push({path,resolve,reject}));
  this.jobs.set(path,job);this.pump();return job;
 }
 pump(){while(this.active<this.concurrency&&this.queue.length){const job=this.queue.shift();this.active++;this.peak=Math.max(this.peak,this.active);this.read(job.path).then(img=>{this.completed++;job.resolve(img);},err=>{this.jobs.delete(job.path);job.reject(err);}).finally(()=>{this.active--;this.pump();});}}
 read(path){return new Promise((resolve,reject)=>{
  const img=this.image();let finished=false;
  const finish=error=>{if(finished)return;finished=true;clearTimeout(timer);img.onload=img.onerror=null;error?reject(error):resolve(img);};
  const timer=setTimeout(()=>finish(Error('Art load timed out: '+path)),60000);
  img.onload=async()=>{try{if(img.decode)await img.decode();finish();}catch{finish(Error('Unable to decode '+path));}};
  img.onerror=()=>finish(Error('Unable to load '+path));
  try{const source=this.source(path);if(source?.then)source.then(value=>{if(!finished)img.src=value;},finish);else img.src=source;}catch(e){finish(e);}
 });}
 forget(path){this.jobs.delete(path);}
 snapshot(){return{active:this.active,queued:this.queue.length,peak:this.peak,completed:this.completed,resident:this.jobs.size};}
}
