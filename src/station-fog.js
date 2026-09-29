import * as THREE from '../vendor/three.module.js';
export const VIEW_DISTANCE=20;

// Four world-space density samples per visible fragment. No fog particles,
// transparent planes, extra render targets, or per-frame geometry allocations.
const densityGLSL=`
uniform float stationFogTime;
varying vec3 stationFogPosition;
float stationDensity(vec3 p) {
 p += vec3(stationFogTime*.18, stationFogTime*.04, -stationFogTime*.11);
 float cloud = sin(p.x*.29 + sin(p.z*.17)) * sin(p.z*.23 + p.y*.31);
 float floorMist = .5 + .5*sin(p.y*.85 + p.x*.035);
 return .035 + .045*smoothstep(-.5,.65,cloud) + .014*floorMist;
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
 stationFogAmount = mix(stationFogAmount, 1., smoothstep(7., 20., stationDistance));
 gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, stationFogAmount);
 }
#endif
`;

export class StationFog{
 constructor(scene,camera,color){
  this.scene=scene;this.camera=camera;this.time={value:0};this.enabled={value:1};this.materials=new WeakSet();this.scanAge=1;
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
   shader.uniforms.stationCameraWorld={value:this.camera.matrixWorld};
   shader.vertexShader='uniform mat4 stationCameraWorld;\nvarying vec3 stationFogPosition;\n'+shader.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\nstationFogPosition = (stationCameraWorld * mvPosition).xyz;');
   shader.fragmentShader='uniform float stationFogEnabled;\n'+densityGLSL+shader.fragmentShader.replace('#include <fog_fragment>',volumeGLSL);
  };
  material.customProgramCacheKey=()=>previousKey+'-station-volume-v11';material.needsUpdate=true;
 }
 update(dt){
  this.time.value+=dt;this.scanAge+=dt;
  if(this.scanAge<.5)return;this.scanAge=0;
  this.scene.traverse(o=>{if(Array.isArray(o.material))o.material.forEach(m=>this.attach(m));else this.attach(o.material);});
 }
}
