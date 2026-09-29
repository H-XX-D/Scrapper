import{createReadStream}from'node:fs';import{open}from'node:fs/promises';import{basename}from'node:path';import{createDeflateRaw}from'node:zlib';import{Transform}from'node:stream';
const table=Uint32Array.from({length:256},(_,i)=>{let c=i;for(let n=0;n<8;n++)c=(c>>>1)^(c&1?0xedb88320:0);return c>>>0;});
// Stream a standard ZIP containing the exact standalone HTML. Fixed metadata
// avoids timestamps; CRC and sizes are written after compression, without a
// second full copy of the cartridge in Node's heap.
export async function zipCartridge(input,output){
 const name=Buffer.from(basename(input)),file=await open(output,'w');let crc=0xffffffff,size=0,compressed=0,offset=0;
 const write=async b=>{let used=0;while(used<b.length){const r=await file.write(b,used,b.length-used,offset);used+=r.bytesWritten;offset+=r.bytesWritten;}};
 try{
  const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(8,6);local.writeUInt16LE(8,8);local.writeUInt16LE(33,12);local.writeUInt16LE(name.length,26);await write(local);await write(name);
  const tally=new Transform({transform(chunk,_,done){size+=chunk.length;for(const b of chunk)crc=(crc>>>8)^table[(crc^b)&255];done(null,chunk);}}),source=createReadStream(input),deflate=createDeflateRaw({level:9});source.on('error',e=>tally.destroy(e));tally.on('error',e=>deflate.destroy(e));source.pipe(tally).pipe(deflate);
  for await(const chunk of deflate){compressed+=chunk.length;await write(chunk);}crc=(crc^0xffffffff)>>>0;
  const descriptor=Buffer.alloc(16);descriptor.writeUInt32LE(0x08074b50);descriptor.writeUInt32LE(crc,4);descriptor.writeUInt32LE(compressed,8);descriptor.writeUInt32LE(size,12);await write(descriptor);
  const centralOffset=offset,central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(8,8);central.writeUInt16LE(8,10);central.writeUInt16LE(33,14);central.writeUInt32LE(crc,16);central.writeUInt32LE(compressed,20);central.writeUInt32LE(size,24);central.writeUInt16LE(name.length,28);await write(central);await write(name);
  const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);end.writeUInt32LE(offset-centralOffset,12);end.writeUInt32LE(centralOffset,16);await write(end);return{bytes:offset,htmlBytes:size};
 }finally{await file.close();}
}
