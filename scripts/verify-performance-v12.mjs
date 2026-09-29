import{execFileSync}from'node:child_process';import{readFileSync,writeFileSync}from'node:fs';import{resolve}from'node:path';import{pathToFileURL}from'node:url';import{createHash}from'node:crypto';
const run=Date.now().toString(36),fixture=readFileSync('tests/browser/performance-v12.js','utf8');
for(const [version,file]of[['v11','Scrapper-Playable-v11.html'],['v12','Scrapper-Fast-Load-v12/Scrapper.html']]){
 const session='combat-'+version+'-'+run,path=resolve('exports',file),call=(...args)=>execFileSync('agent-browser',['--session',session,...args],{encoding:'utf8',maxBuffer:3e6}),ev=code=>JSON.parse(call('eval',code));
 call('open',pathToFileURL(path).href);for(let i=0;i<100&&!ev('!!window.scrapperReady');i++)await new Promise(r=>setTimeout(r,200));
 const result=ev(fixture);result.version=version;result.sha256=createHash('sha256').update(readFileSync(path)).digest('hex');result.errors=call('errors').trim();
 writeFileSync('artifacts/performance-'+(version==='v11'?'baseline':'current')+'-v12.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));call('close');
 if(result.errors)throw Error(result.errors);
}
