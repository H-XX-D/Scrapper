import test from'node:test';import assert from'node:assert/strict';import{readFileSync,existsSync}from'node:fs';import{Script}from'node:vm';import{SPECS}from'../src/atlas.js';
const path=new URL('../exports/Scrapper.html',import.meta.url);
test('standalone export contains executable scripts and embeds every requested asset', {skip:!existsSync(path)},()=>{
 const html=readFileSync(path,'utf8'),scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];assert.equal(scripts.length,3);for(const[,script]of scripts)assert.doesNotThrow(()=>new Script(script));
 assert.equal(/<script[^>]+src=/.test(html),false);assert.equal(/<link[^>]+rel="stylesheet"/.test(html),false);
 const match=scripts.find(s=>s[1].startsWith('window.__SCRAPPER_ASSETS'))[1].match(/^window\.__SCRAPPER_ASSETS=(.*);$/s);assert.ok(match);const assets=JSON.parse(match[1]);for(const spec of Object.values(SPECS))assert.ok(assets[spec.path],'missing '+spec.path);for(const asset of Object.values(assets))assert.match(asset,/^data:image\/png;base64,/);
 assert.ok(assets['assets/legacy/story-portraits.png']);assert.ok(assets['assets/generated/reload-bolt.png']);assert.ok(assets['assets/generated/colored-splatter.png']);
});
