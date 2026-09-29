import sharp from 'sharp';
// Lossless codec only: dimensions, colors, alpha and even invisible RGB must match.
export async function packImage(input){
 const packed=await sharp(input).webp({lossless:true,exact:true,effort:6}).toBuffer();
 if(packed.length>=input.length)return{buffer:input,mime:'image/png',verified:true};
 const [before,after]=await Promise.all([sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true}),sharp(packed).ensureAlpha().raw().toBuffer({resolveWithObject:true})]);
 const identical=before.info.width===after.info.width&&before.info.height===after.info.height&&before.data.equals(after.data);
 return identical?{buffer:packed,mime:'image/webp',verified:true}:{buffer:input,mime:'image/png',verified:true};
}
