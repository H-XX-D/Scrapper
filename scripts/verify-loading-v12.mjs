import {execFileSync} from 'node:child_process';
import {writeFileSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const call=(s,...args)=>execFileSync('agent-browser',['--session',s,...args],{encoding:'utf8',maxBuffer:2e6});
const ev=(s,code)=>JSON.parse(call(s,'eval',code));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const results=[],run=Date.now().toString(36);
for(const [name,file] of [['v11','Scrapper-Playable-v11.html'],['v12-fast','Scrapper-Fast-Load-v12/Scrapper.html'],['v12-portable','Scrapper-Playable-v12.html']]){
 const session='load-'+name+'-'+run;call(session,'--init-script',resolve('tests/browser/loading-init-v12.js'),'open',pathToFileURL(resolve('exports',file)).href);
 for(let i=0;i<160&&!ev(session,'!!window.scrapperReady');i++)await wait(200);
 if(!ev(session,'!!window.scrapperReady'))throw Error('Title timeout '+name);
 await wait(200);const title=ev(session,'({...window.loadingBenchmark,assets:window.scrapper.loading?.().assets,resolution:[innerWidth,innerHeight,devicePixelRatio]})');
 const mission=ev(session,'(async()=>{const at=performance.now();await scrapper.start();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const s=scrapper.snapshot();scrapper.pause();return{elapsed:performance.now()-at,running:s.running,actors:s.actors.length,assets:scrapper.loading?.().assets};})()');
 const errors=call(session,'errors').trim();results.push({name,sha256:createHash('sha256').update(readFileSync(resolve('exports',file))).digest('hex'),title,mission,errors});console.log(JSON.stringify(results.at(-1)));call(session,'close');
}
writeFileSync('artifacts/loading-v12.json',JSON.stringify({method:'One fresh browser session per local-file export, OS disk cache uncontrolled; same machine, sequential. Title enabled and next rendered frame timed from navigation.',results},null,2));
