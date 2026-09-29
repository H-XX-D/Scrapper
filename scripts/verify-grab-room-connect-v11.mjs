import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const gameUrl=pathToFileURL(resolve('exports/Scrapper-Playable-v11.html')).href;
const sessions=['scrapper-v11','v11-guest1','v11-guest2','v11-guest3'];
const call=(s,...args)=>execFileSync('agent-browser',['--session',s,...args],{encoding:'utf8',maxBuffer:2e6});
const ev=(s,code)=>JSON.parse(call(s,'eval',code));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
for(const s of sessions){call(s,'open',gameUrl);for(let i=0;i<40;i++){if(ev(s,'!!window.scrapperReady'))break;await wait(300);}if(!ev(s,'!!window.scrapperReady'))throw Error('Not ready '+s);}
ev(sessions[0],'window.scrapper.room.host("coop","rook");true');
let code;for(let i=0;i<40;i++){code=ev(sessions[0],'window.scrapper.snapshot().net.code');if(code)break;await wait(250);}if(!code)throw Error('No room code');
for(const s of sessions.slice(1))ev(s,`window.scrapper.room.join('${code}','rook');true`);
let count;for(let i=0;i<60;i++){count=ev(sessions[0],"document.querySelectorAll('#room-roster .roster-card').length");if(count===4)break;await wait(300);}if(count!==4)throw Error('Incomplete room '+count);
console.log(JSON.stringify({code,members:ev(sessions[0],"Array.from(document.querySelectorAll('#room-roster .roster-card strong'),e=>e.textContent)")},null,2));
