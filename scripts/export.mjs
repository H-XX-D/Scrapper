import{readFile,writeFile,mkdir}from'node:fs/promises';
import{resolve,extname}from'node:path';
import{createHash}from'node:crypto';
import{packImage}from'./pack-image.mjs';
import{zipCartridge}from'./zip-cartridge.mjs';
import * as esbuild from'esbuild';
import{SPECS}from'../src/atlas.js';
const root=resolve(import.meta.dirname,'..');
const mime={'.png':'image/png','.ttf':'font/ttf'};
const packedPaths=new Map(),assetReport=[];const cache=resolve(root,'node_modules/.cache/scrapper-lossless-v11');await mkdir(cache,{recursive:true});
async function dataURL(path){
 if(packedPaths.has(path))return packedPaths.get(path);
 const input=await readFile(resolve(root,path));let buffer=input,type=mime[extname(path)]||'application/octet-stream';
 if(extname(path)==='.png'){
  const key=createHash('sha256').update(input).digest('hex'),file=resolve(cache,key+'.json');let hit;
  try{hit=JSON.parse(await readFile(file,'utf8'));}catch{}
  if(hit){buffer=Buffer.from(hit.data,'base64');type=hit.mime;}
  else{const result=await packImage(input);buffer=result.buffer;type=result.mime;await writeFile(file,JSON.stringify({mime:type,data:buffer.toString('base64')}));}
 }
 assetReport.push({path,sourceBytes:input.length,packedBytes:buffer.length,mime:type,pixelExact:true});const url=`data:${type};base64,${buffer.toString('base64')}`;packedPaths.set(path,url);return url;
}
const assets={};for(const path of new Set(Object.values(SPECS).map(s=>s.path)))assets[path]=await dataURL(path);
let html=await readFile(resolve(root,'index.html'),'utf8');
for(const path of ['style.css','classic.css']){
 let css=await readFile(resolve(root,path),'utf8');
 for(const match of [...css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)])if(!match[1].startsWith('data:'))css=css.replace(match[0],`url('${await dataURL(match[1])}')`);
 html=html.replace(`<link rel="stylesheet" href="${path}">`,`<style>${css}</style>`);
}
const result=await esbuild.build({absWorkingDir:root,entryPoints:['src/app.js'],bundle:true,write:false,format:'iife',target:'es2022',minify:true,legalComments:'inline'});
const peerScript=(await readFile(resolve(root,'vendor/peerjs.min.js'),'utf8')).replace(/<\/script/gi,'<\\/script');
const script=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
html=html.replace('<script type="module" src="src/app.js"></script>',()=>`<script>window.__SCRAPPER_ASSETS=${JSON.stringify(assets)};</script><script>${script}</script>`);
html=html.replace('<script src="vendor/peerjs.min.js"></script>',()=>'<script>'+peerScript+'</script>');
html=html.replace('</head>','<meta name="scrapper-build" content="2026-09-29-peel-fog-projectiles-dressing-v11"></head>');
await mkdir(resolve(root,'exports'),{recursive:true});
const path=resolve(root,'exports/Scrapper.html');await writeFile(path,html);await writeFile(resolve(root,'exports/Scrapper-Playable-v11.html'),html);console.log(`Exported ${path}\n${(Buffer.byteLength(html)/1048576).toFixed(1)} MiB · all code, art and fonts embedded · no server required`);

await writeFile(resolve(root,'exports/size-report-v11.json'),JSON.stringify({htmlBytes:Buffer.byteLength(html),sourceBytes:assetReport.reduce((n,a)=>n+a.sourceBytes,0),packedBytes:assetReport.reduce((n,a)=>n+a.packedBytes,0),assets:assetReport},null,2)+'\n');

const zip=await zipCartridge(resolve(root,'exports/Scrapper-Playable-v11.html'),resolve(root,'exports/Scrapper-Playable-v11.zip'));console.log(`ZIP download: ${(zip.bytes/1048576).toFixed(1)} MiB; contains the identical playable HTML.`);
