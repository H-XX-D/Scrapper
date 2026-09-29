import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {inflateRawSync} from 'node:zlib';
import {zipFiles} from '../scripts/zip-cartridge.mjs';
test('folder ZIP preserves multiple independent files and all central-directory offsets',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'scrapper-folder-'));
 try{
  const contents=[Buffer.from('<html>launcher</html>'),Buffer.from(Array.from({length:4096},(_,i)=>i%256)),Buffer.from('Read me\n')],names=['Game/Scrapper.html','Game/assets/art.webp','Game/README.txt'],entries=[];
  for(let i=0;i<contents.length;i++){const path=join(dir,String(i));await writeFile(path,contents[i]);entries.push({path,name:names[i]});}
  const out=join(dir,'game.zip'),result=await zipFiles(entries,out),zip=await readFile(out),end=zip.length-22;
  assert.equal(result.files,3);assert.equal(zip.readUInt16LE(end+10),3);let central=zip.readUInt32LE(end+16);
  for(let i=0;i<contents.length;i++){
   assert.equal(zip.readUInt32LE(central),0x02014b50);const length=zip.readUInt16LE(central+28),local=zip.readUInt32LE(central+42),compressed=zip.readUInt32LE(central+20),start=local+30+zip.readUInt16LE(local+26);
   assert.equal(zip.subarray(central+46,central+46+length).toString(),names[i]);assert.equal(zip.readUInt32LE(local),0x04034b50);assert.deepEqual(inflateRawSync(zip.subarray(start,start+compressed)),contents[i]);central+=46+length;
  }
  assert.equal(central,end);await assert.rejects(zipFiles([{path:entries[0].path,name:'../escape'}],join(dir,'bad.zip')),/Unsafe/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
