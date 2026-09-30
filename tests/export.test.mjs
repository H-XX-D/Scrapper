import test from'node:test';import assert from'node:assert/strict';import{readFileSync,existsSync}from'node:fs';import{Script}from'node:vm';import{createHash}from'node:crypto';import{SPECS}from'../src/atlas.js';
const path=new URL('../exports/Scrapper.html',import.meta.url);
test('standalone export keeps all art in inert payloads, with only small executable scripts',{skip:!existsSync(path)},()=>{
 const html=readFileSync(path,'utf8'),scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];assert.equal(scripts.length,3);for(const[,script]of scripts){assert.doesNotThrow(()=>new Script(script));assert.ok(script.length<2e6);}
 assert.equal(/<script[^>]+src=/.test(html),false);assert.equal(/<link[^>]+rel="stylesheet"/.test(html),false);
 const source=scripts.find(s=>s[1].startsWith('window.__SCRAPPER_ASSETS'))[1],assets=JSON.parse(source.match(/^window\.__SCRAPPER_ASSETS=(.*);$/s)[1]);
 const payloads=new Map([...html.matchAll(/<script type="application\/octet-stream" id="([^"]+)">([^<]+)<\/script>/g)].map(m=>['#'+m[1],m[2]]));
 for(const spec of Object.values(SPECS))assert.ok(/^data:image\/(?:png|webp);base64,/.test(payloads.get(assets[spec.path])),'missing '+spec.path);
});
test('fast-load folder includes all separately addressed art and the identical lossless data',{skip:!existsSync(new URL('../exports/Scrapper-Fast-Load-v13/manifest.json',import.meta.url))},()=>{
 const root=new URL('../exports/Scrapper-Fast-Load-v13/',import.meta.url),manifest=JSON.parse(readFileSync(new URL('manifest.json',root))),html=readFileSync(new URL('Scrapper.html',root),'utf8');
 assert.ok(html.length<2e6);assert.equal(/src="(?:https?:|vendor\/|src\/)/.test(html),false);
 for(const asset of manifest.assets){const buffer=readFileSync(new URL(asset.file,root));assert.equal(buffer.length,asset.fileBytes);assert.equal(createHash('sha256').update(buffer).digest('hex'),asset.fileSha256);let pixels=buffer;if(asset.chunk){let data;new Script(buffer.toString()).runInNewContext({__SCRAPPER_CHUNKS:{[asset.file]:value=>{data=value;}}});assert.ok(data.startsWith('data:'+asset.mime+';base64,'));pixels=Buffer.from(data.split(',')[1],'base64');}assert.equal(pixels.length,asset.packedBytes);assert.equal(createHash('sha256').update(pixels).digest('hex'),asset.sha256);}
 const packed=new Set(manifest.assets.map(a=>a.path));for(const spec of Object.values(SPECS))assert.ok(packed.has(spec.path));
 assert.equal(createHash('sha256').update(html).digest('hex'),manifest.launcher.sha256);
});
