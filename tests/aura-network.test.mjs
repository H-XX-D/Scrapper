import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {AURA_WORDS,AURA_CONTRACT,encodeValue,decodeValue,stateDelta,applyDelta,AuraEncoder,AuraDecoder,MAX_PACKET_BYTES} from '../src/aura-codec.js';
import {NetRoom,PROTOCOL,NETWORK_QUEUE_LIMIT} from '../src/network.js';
import {peerState} from '../src/network-state.js';
const state=(x=1)=>({crew:[{id:'b',player:{x,y:0,z:0,hp:100},arsenal:{selected:'bolt',slots:{bolt:{mag:24}}},visor:{stains:[]}}],actors:[{id:1,type:'beetle',x,y:0,z:0,hp:30}],projectiles:[],waves:[],events:[],infestation:{clock:1,patches:[]},clingerPods:[],mission:{complete:false}});
test('AURA handshake fingerprint pins the exact shared vocabulary',()=>{
 assert.equal(AURA_CONTRACT.split(':')[1],createHash('sha256').update([...new Set(AURA_WORDS)].join('\0')).digest('hex'));
});
test('binary values preserve unicode, floats, negative zero, safe integers and repeated keys exactly',()=>{
 const value={x:-0,y:Number.MAX_SAFE_INTEGER,z:Number.MIN_SAFE_INTEGER,hp:1.0000000000000002,empty:'',emoji:'👾🛠️',nested:[null,false,true,'beetle','same','same',{arbitrary:'水'}]};
 assert.deepEqual(decodeValue(encodeValue(value)),value);
 for(let i=0;i<1000;i++){const n=Math.sin(i)*1e7;assert.equal(decodeValue(encodeValue(n)),n);}
});
test('decoder rejects truncated/oversized packets, unknown tokens and prototype keys',()=>{
 const bytes=encodeValue(state());for(let i=0;i<bytes.length;i++)assert.throws(()=>decodeValue(bytes.slice(0,i)));
 assert.throws(()=>decodeValue(new Uint8Array(MAX_PACKET_BYTES+1)));
 assert.throws(()=>decodeValue(Uint8Array.from([9,255,255,127])));
 assert.throws(()=>encodeValue(JSON.parse('{"__proto__":{"polluted":true}}')));
 assert.throws(()=>encodeValue({a:NaN}));assert.equal({}.polluted,undefined);
});
test('deltas retain nulls, deletions, shortened and extended arrays and false values',()=>{
 const a={x:1,remove:9,array:[1,{hp:10},3],object:{keep:true}},b={x:null,array:[1,{hp:0}],object:{keep:false,new:[]}};
 assert.deepEqual(applyDelta(a,decodeValue(encodeValue(stateDelta(a,b)))),b);
 assert.deepEqual(applyDelta([1],stateDelta([1],[1,2,null])),[1,2,null]);
 assert.equal(stateDelta(b,structuredClone(b)),null);assert.deepEqual(a.array,[1,{hp:10},3]);
});
test('acknowledged per-peer deltas survive skipped sends, mutable consumers and entity removal/reentry',()=>{
 const encoder=new AuraEncoder(),decoder=new AuraDecoder(),first=encoder.prepare(state(),1,100);
 encoder.commit(first);const received=decoder.accept(first);encoder.acknowledge(1);
 received.actors[0].x=999;received.mission.complete=true;
 const second=encoder.prepare(state(2),2,200);assert.equal(second.base,1);encoder.commit(second);assert.deepEqual(decoder.accept(second),state(2));
 // Skip an unsent frame. Neither encoder nor receiver advances its base for it.
 encoder.prepare(state(3),3,300);
 const gone=state(4);gone.actors=[];const fourth=encoder.prepare(gone,4,400);assert.equal(fourth.base,1);encoder.commit(fourth);assert.deepEqual(decoder.accept(fourth),gone);
 encoder.acknowledge(4);const fifth=encoder.prepare(state(5),5,500);encoder.commit(fifth);assert.deepEqual(decoder.accept(fifth),state(5));
 assert.equal(encoder.acknowledge(2),false);
});
test('missing baselines fail closed and a fresh keyframe repairs the stream',()=>{
 const e=new AuraEncoder(),d=new AuraDecoder(),a=e.prepare(state(),1,0);e.commit(a);e.acknowledge(1);
 const b=e.prepare(state(2),2,100);assert.throws(()=>d.accept(b),/baseline/);
 e.reset();const c=e.prepare(state(3),3,200);assert.equal(c.base,0);e.commit(c);assert.deepEqual(d.accept(c),state(3));
 assert.throws(()=>d.accept(c),/sequence/);
});
test('unacknowledged state has bounded storage and outstanding work',()=>{
 const e=new AuraEncoder();for(let seq=1;seq<=8;seq++){const p=e.prepare(state(seq),seq,seq*80);assert.ok(p);e.commit(p);}
 assert.equal(e.prepare(state(9),9,720),null);
 const p=e.prepare(state(10),10,1400);assert.ok(p);e.commit(p);assert.equal(e.pending.size,8);
});
test('split players receive their own nearby enemies and effects while mission and crew data remain shared',()=>{
 const s=state();s.crew.push({id:'c',player:{x:100,y:0,z:0,hp:100},arsenal:{selected:'arc',slots:{arc:{mag:4}}},visor:{stains:[]}});
 s.actors.push({id:2,type:'crawler',x:105,y:0,z:0,hp:40},{id:3,type:'beetle',x:3,y:0,z:0,hp:40,dormant:true});
 s.events=[{id:1,kind:'burst',data:{x:1,y:0,z:0}},{id:2,kind:'burst',data:{x:101,y:0,z:0}}];
 s.guardians=[{id:4,x:300,y:9,z:0,hp:100}];
 const b=peerState(s,'b'),c=peerState(s,'c');
 assert.deepEqual(b.actors.map(a=>a.id),[1]);assert.deepEqual(c.actors.map(a=>a.id),[2]);
 assert.deepEqual(b.events.map(a=>a.id),[1]);assert.deepEqual(c.events.map(a=>a.id),[2]);
 assert.equal(b.crew.length,2);assert.deepEqual(c.guardians,s.guardians);assert.equal(b.mission.complete,false);
 assert.equal(b.crew[1].arsenal.slots,undefined);assert.ok(c.crew[1].arsenal.slots);
});
function pair(aura=true){
 const received=[],host=new NetRoom(()=>{}),guest=new NetRoom(e=>{if(e.type==='frame')received.push(e.state);});
 const hc={peer:'b',open:true,dataChannel:{bufferedAmount:0},send:d=>guest.receive(gc,d)},gc={peer:'host',open:true,dataChannel:{bufferedAmount:0},send:d=>host.receive(hc,d)};
 host.role='host';host.active=true;host.runId='run';host.members=[{id:'host'},{id:'b'}];host.connections.set('b',hc);
 guest.role='guest';guest.active=true;guest.runId='run';guest.host=gc;host.negotiate(hc,aura?AURA_CONTRACT:'mismatch');
 return{host,guest,hc,gc,received};
}
test('real NetRoom selection negotiates AURA, isolates buffers, and raw fallback keeps game state',()=>{
 for(const aura of[true,false]){const {host,guest,hc,received}=pair(aura);host.publish(()=>state(),100);assert.equal(received.length,1);assert.equal(guest.metrics.codec,aura?'aura-delta':'raw');
  hc.dataChannel.bufferedAmount=NETWORK_QUEUE_LIMIT;host.publish(()=>{throw Error('Snapshot built under congestion');},200);assert.equal(received.length,1);
  hc.dataChannel.bufferedAmount=0;host.publish(()=>state(4),300);assert.equal(received.at(-1).actors[0].x,4);assert.equal(host.metrics.skipped,1);
 }
});
test('run IDs protect acknowledgements, resync and inputs from the prior mission',()=>{
 const {host,hc}=pair();const stream=host.streams.get('b');host.publish(state(),100);
 const base=stream.encoder.base;host.receive(hc,{v:PROTOCOL,type:'resync',runId:'old'});assert.equal(stream.encoder.base,base);
 host.receive(hc,{v:PROTOCOL,type:'input',runId:'old',seq:999,forward:1});assert.equal(host.inputs.size,0);
});
