import{readFile,writeFile,mkdir,unlink}from'node:fs/promises';
import{resolve,extname}from'node:path';
import{createHash}from'node:crypto';
import{packImage}from'./pack-image.mjs';
import{zipCartridge,zipFiles}from'./zip-cartridge.mjs';
import * as esbuild from'esbuild';
import{SPECS}from'../src/atlas.js';
import{TITLE_ASSETS,missionAssets}from'../src/asset-plan.js';
const root=resolve(import.meta.dirname,'..'),version='v12',fastName='Scrapper-Fast-Load-'+version,fastRoot=resolve(root,'exports',fastName);
const mime={'.png':'image/png','.ttf':'font/ttf'};
const packedPaths=new Map(),assetReport=[],fastEntries=[];let previousAssets=[];try{previousAssets=JSON.parse(await readFile(resolve(fastRoot,'manifest.json'),'utf8')).assets;}catch{}
const cache=resolve(root,'node_modules/.cache/scrapper-lossless-v11');await mkdir(cache,{recursive:true});await mkdir(resolve(fastRoot,'assets'),{recursive:true});
const digest=buffer=>createHash('sha256').update(buffer).digest('hex');
async function packed(path,chunk=false){
 if(packedPaths.has(path))return packedPaths.get(path);
 const input=await readFile(resolve(root,path));let buffer=input,type=mime[extname(path)]||'application/octet-stream';
 if(extname(path)==='.png'){
  const key=digest(input),file=resolve(cache,key+'.json');let hit;
  try{hit=JSON.parse(await readFile(file,'utf8'));}catch{}
  if(hit){buffer=Buffer.from(hit.data,'base64');type=hit.mime;}
  else{const result=await packImage(input);buffer=result.buffer;type=result.mime;await writeFile(file,JSON.stringify({mime:type,data:buffer.toString('base64')}));}
 }
 const sha=digest(buffer),url=`data:${type};base64,${buffer.toString('base64')}`,file='assets/'+sha.slice(0,24)+(chunk?'.asset.js':type==='image/webp'?'.webp':extname(path)),content=chunk?Buffer.from(`globalThis.__SCRAPPER_CHUNKS[${JSON.stringify(file)}](${JSON.stringify(url)});`):buffer;
 await writeFile(resolve(fastRoot,file),content);
 if(!fastEntries.some(e=>e.name===fastName+'/'+file))fastEntries.push({path:resolve(fastRoot,file),name:fastName+'/'+file});
 assetReport.push({path,file,sha256:sha,sourceBytes:input.length,packedBytes:buffer.length,fileBytes:content.length,fileSha256:digest(content),mime:type,chunk,pixelExact:true});
 const result={url,file,chunk};packedPaths.set(path,result);return result;
}
const embedded={},external={},payload=[];
for(const path of new Set(Object.values(SPECS).map(s=>s.path))){const asset=await packed(path,true),id='scrapper-asset-'+payload.length;embedded[path]='#'+id;external[path]=asset.file;payload.push(`<script type="application/octet-stream" id="${id}">${asset.url}</script>`);}
const template=await readFile(resolve(root,'index.html'),'utf8');let portable=template,fast=template;
for(const path of ['style.css','classic.css']){
 let css=await readFile(resolve(root,path),'utf8'),splitCSS=css;
 for(const match of [...css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)])if(!match[1].startsWith('data:')){const asset=await packed(match[1]);css=css.replace(match[0],`url('${asset.url}')`);splitCSS=splitCSS.replace(match[0],`url('${extname(match[1])==='.ttf'||asset.chunk?asset.url:asset.file}')`);}
 portable=portable.replace(`<link rel="stylesheet" href="${path}">`,`<style>${css}</style>`);fast=fast.replace(`<link rel="stylesheet" href="${path}">`,`<style>${splitCSS}</style>`);
}
const result=await esbuild.build({absWorkingDir:root,entryPoints:['src/app.js'],bundle:true,write:false,format:'iife',target:'es2022',minify:true,legalComments:'inline'});
const peerScript=(await readFile(resolve(root,'vendor/peerjs.min.js'),'utf8')).replace(/<\/script/gi,'<\\/script');
const script=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const finish=(html,assets,extra='')=>html.replace('<script type="module" src="src/app.js"></script>',()=>`${extra}<script>window.__SCRAPPER_ASSETS=${JSON.stringify(assets)};</script><script>${script}</script>`).replace('<script src="vendor/peerjs.min.js"></script>',()=>'<script>'+peerScript+'</script>').replace('</head>','<meta name="scrapper-build" content="2026-09-29-staged-loading-directional-shots-ambush-v12"></head>');
portable=finish(portable,embedded,payload.join(''));fast=finish(fast,external);
const fileName='Scrapper-Playable-'+version+'.html',versioned=resolve(root,'exports',fileName);
await writeFile(resolve(root,'exports/Scrapper.html'),portable);await writeFile(versioned,portable);await writeFile(resolve(fastRoot,'Scrapper.html'),fast);
await writeFile(resolve(fastRoot,'README.txt'),'SCRAPPER V12 - FAST LOAD\n\nExtract the entire folder, then open Scrapper.html. Keep the assets folder beside it. No installation or server is needed for solo play. Online rooms require internet and all players must use V12.\n\nThe title loads first. Selected chapter art loads before deployment. Other station themes and absent crew art stay on disk.\n');
await writeFile(resolve(fastRoot,'manifest.json'),JSON.stringify({version,launcher:{file:'Scrapper.html',bytes:Buffer.byteLength(fast),sha256:digest(fast)},assets:assetReport},null,2)+'\n');
for(const old of previousAssets)if(/^assets\/[0-9a-f]{24}\.(?:webp|png|ttf|asset\.js)$/.test(old.file)&&!assetReport.some(a=>a.file===old.file))await unlink(resolve(fastRoot,old.file)).catch(()=>{});
for(const name of['Scrapper.html','README.txt','manifest.json'])fastEntries.push({path:resolve(fastRoot,name),name:fastName+'/'+name});
const bytesFor=ids=>{const paths=new Set(ids.map(id=>SPECS[id].path));return assetReport.filter(a=>paths.has(a.path)).reduce((n,a)=>n+a.packedBytes,0);};
await writeFile(resolve(root,'exports/size-report-'+version+'.json'),JSON.stringify({htmlBytes:Buffer.byteLength(portable),launcherBytes:Buffer.byteLength(fast),titleArtBytes:bytesFor(TITLE_ASSETS),firstMissionArtBytes:bytesFor(missionAssets(0)),sourceBytes:assetReport.reduce((n,a)=>n+a.sourceBytes,0),packedBytes:assetReport.reduce((n,a)=>n+a.packedBytes,0),assets:assetReport},null,2)+'\n');
await writeFile(resolve(root,'exports','Scrapper-Playable-'+version+'.sha256'),digest(portable)+'  '+fileName+'\n');
console.log(`Standalone: ${(Buffer.byteLength(portable)/1048576).toFixed(1)} MiB. Fast launcher: ${(Buffer.byteLength(fast)/1048576).toFixed(2)} MiB. ${assetReport.length} separately addressable art/font files.`);
const zip=await zipCartridge(versioned,resolve(root,'exports','Scrapper-Playable-'+version+'.zip'));console.log(`Portable ZIP: ${(zip.bytes/1048576).toFixed(1)} MiB.`);
const fastZip=await zipFiles(fastEntries,resolve(root,'exports',fastName+'.zip'));console.log(`Fast-load ZIP: ${(fastZip.bytes/1048576).toFixed(1)} MiB; ${fastZip.files} files, extract and open Scrapper.html.`);
