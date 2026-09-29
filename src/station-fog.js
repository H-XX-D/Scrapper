import * as THREE from '../vendor/three.module.js';
export const VIEW_DISTANCE=20;

// Four world-space density samples per visible fragment. No fog particles,
// transparent planes, extra render targets, or per-frame geometry allocations.
const densityGLSL=`
uniform float stationFogTime;
uniform float stationFloorY;
uniform sampler2D stationFloors;
uniform vec4 stationFloorBounds;
varying vec3 stationFogPosition;
float stationFloor(vec3 p) {
 vec2 uv=(p.xz-stationFloorBounds.xy)/stationFloorBounds.zw;
 if(any(lessThan(uv,vec2(0.)))||any(greaterThan(uv,vec2(1.))))return stationFloorY;
 vec4 levels=texture2D(stationFloors,uv);float floorY=-999.;
 for(int i=0;i<4;i++)if(levels[i]<=p.y+.2)floorY=max(floorY,levels[i]);
 return floorY < -900. ? stationFloorY : floorY;
}
float stationDensity(vec3 p) {
 float height=max(0.,p.y-stationFloor(p));
 float nearClear=smoothstep(1.2,5.,length(p-cameraPosition));
 vec3 drift=p+vec3(stationFogTime*.72,0.,-stationFogTime*.4);
 float rolling=sin(drift.x*.7+sin(drift.z*.31+stationFogTime*.2))*sin(drift.z*.54+sin(drift.x*.19));
 float tendrils=.5+.5*sin(drift.x*1.3+drift.z*.57+sin(drift.z*.9)*2.);
 float bank=exp(-height*(1.6+.5*tendrils));
 return nearClear*(.013+bank*(.08+.2*smoothstep(-.6,.7,rolling)+.07*tendrils));
}
`;
const volumeGLSL=`
#ifdef USE_FOG
 if (stationFogEnabled > .5) {
 vec3 stationRay = stationFogPosition - cameraPosition;
 float stationDistance = length(stationRay);
 float stationOpticalDepth = 0.;
 for (int fogStep=0;fogStep<4;fogStep++) {
  vec3 fogSample = cameraPosition + stationRay * (float(fogStep)+.5)/4.;
  stationOpticalDepth += stationDensity(fogSample);
 }
 float stationFogAmount = 1. - exp(-stationOpticalDepth * max(0.,stationDistance-2.)/4.);
 stationFogAmount = mix(stationFogAmount, 1., smoothstep(10., 20., stationDistance));
 gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, stationFogAmount);
 }
#endif
`;

export class StationFog{
 constructor(scene,camera,color,world){
  this.scene=scene;this.camera=camera;this.time={value:0};this.enabled={value:1};this.materials=new WeakSet();this.scanAge=1;
  this.floorY={value:0};const cells=world?.renderCells()||[{x:0,z:0,y:0}],xs=cells.map(c=>c.x),zs=cells.map(c=>c.z),minX=Math.min(...xs),minZ=Math.min(...zs),width=Math.max(...xs)-minX+1,height=Math.max(...zs)-minZ+1;
  const data=new Float32Array(width*height*4).fill(-999);
  for(const c of cells){if(c.gap)continue;const offset=((c.z-minZ)*width+c.x-minX)*4,values=[...data.slice(offset,offset+4),c.y].filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>b-a).slice(0,4);data.set(values,offset);}
  this.floors=new THREE.DataTexture(data,width,height,THREE.RGBAFormat,THREE.FloatType);this.floors.needsUpdate=true;this.floors.minFilter=this.floors.magFilter=THREE.NearestFilter;this.floorBounds={value:new THREE.Vector4(minX*2,minZ*2,width*2,height*2)};
  // The native fog also supplies the color uniforms and the fallback for any
  // material compiled before the first scan.
  scene.fog=new THREE.Fog(color,4,VIEW_DISTANCE);
 }
 attach(material){
  if(!material||!material.fog||this.materials.has(material)||material.isShaderMaterial)return;
  this.materials.add(material);
  const previous=material.onBeforeCompile,previousKey=material.customProgramCacheKey();
  material.onBeforeCompile=(shader,renderer)=>{
   previous.call(material,shader,renderer);
   shader.uniforms.stationFogTime=this.time;
   shader.uniforms.stationFogEnabled=this.enabled;
   shader.uniforms.stationFloorY=this.floorY;shader.uniforms.stationFloors={value:this.floors};shader.uniforms.stationFloorBounds=this.floorBounds;
   shader.uniforms.stationCameraWorld={value:this.camera.matrixWorld};
   shader.vertexShader='uniform mat4 stationCameraWorld;\nvarying vec3 stationFogPosition;\n'+shader.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\nstationFogPosition = (stationCameraWorld * mvPosition).xyz;');
   shader.fragmentShader='uniform float stationFogEnabled;\n'+densityGLSL+shader.fragmentShader.replace('#include <fog_fragment>',volumeGLSL);
  };
  material.customProgramCacheKey=()=>previousKey+'-station-floor-flow-v12';material.needsUpdate=true;
 }
 update(dt,player){
  if(player)this.floorY.value=player.y;
  this.time.value+=dt;this.scanAge+=dt;
  if(this.scanAge<.5)return;this.scanAge=0;
  this.scene.traverse(o=>{if(Array.isArray(o.material))o.material.forEach(m=>this.attach(m));else this.attach(o.material);});
 }
 dispose(){this.floors.dispose();}
}
