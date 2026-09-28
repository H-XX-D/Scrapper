import{readFile,writeFile,mkdir}from'node:fs/promises';
import{resolve,extname}from'node:path';
import * as esbuild from'esbuild';
import{SPECS}from'../src/atlas.js';
const root=resolve(import.meta.dirname,'..');
const mime={'.png':'image/png','.ttf':'font/ttf'};
async function dataURL(path){return`data:${mime[extname(path)]||'application/octet-stream'};base64,${(await readFile(resolve(root,path))).toString('base64')}`;}
const assets={};for(const spec of Object.values(SPECS))assets[spec.path]=await dataURL(spec.path);
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
html=html.replace('</head>','<meta name="scrapper-build" content="2026-09-28-crew-and-suit-fixes-v8"></head>');
await mkdir(resolve(root,'exports'),{recursive:true});
const path=resolve(root,'exports/Scrapper.html');await writeFile(path,html);await writeFile(resolve(root,'exports/Scrapper-Playable-v8.html'),html);console.log(`Exported ${path}\n${(Buffer.byteLength(html)/1048576).toFixed(1)} MiB · all code, art and fonts embedded · no server required`);
