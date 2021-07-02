import * as THREE from 'https://cdn.skypack.dev/three';
import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'https://cdn.skypack.dev/three/examples/jsm/libs/dat.gui.module.js';
import Stats from 'https://cdn.skypack.dev/three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/EffectComposer.js';
import { SSAOPass } from 'https://cdn.skypack.dev/three/examples/jsm/postprocessing/SSAOPass.js';

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function parseThreeColor(color) {
  return ''
}
const bg = '#fff'
const col_accent = '#ff0000'
const col_main = '#cbcbcb'

const scene = new THREE.Scene();
scene.background = new THREE.Color( bg );
scene.fog = new THREE.FogExp2( bg, 0.03 );

const args = [ 60, window.innerWidth / window.innerHeight, 1, 10000 ]
const camera = new THREE.PerspectiveCamera( args[0], args[1], args[2], args[3] );
camera.position.set( 10, 20, 30 );

const composer = new EffectComposer( renderer );

const ssaoPass = new SSAOPass( scene, camera, window.innerWidth, window.innerHeight );
ssaoPass.kernelRadius = 1;
ssaoPass.minDistance = 0.001;
ssaoPass.maxDistance = 0.1;
composer.addPass( ssaoPass );

const controls = new OrbitControls( camera, renderer.domElement );
const angle = 0;
controls.addEventListener( 'change', render ); // use if there is no animation loop
controls.target.set( 0, 1, 0 );
controls.update();
controls.enablePan = false;
controls.enableZoom  = false;
controls.enableDamping = true;
controls.autoRotate = true;
controls.maxPolarAngle = Math.PI / (2 - angle);
controls.minPolarAngle = Math.PI - Math.PI / (2 - angle);
controls.minPolarAngle = 0;


window.onmousemove = logMouseMove;

function logMouseMove(event) {
  const multiplier = 0.6;
  let e = event || window.event;
  let speed = -(document.body.clientWidth / 2 - e.clientX) / document.body.clientWidth
  controls.autoRotateSpeed = speed * multiplier;
}




const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 0.5 );
hemiLight.position.set( 0, 200, 0 );
scene.add( hemiLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
directionalLight.position.set( 0, 200, 100 );
directionalLight.castShadow = true;
directionalLight.shadow.camera.top = 180;
directionalLight.shadow.camera.bottom = - 100;
directionalLight.shadow.camera.left = - 120;
directionalLight.shadow.camera.right = 120;
directionalLight.shadow.radius = 32;
directionalLight.shadow.mapSize.width = 512; // default is 512
directionalLight.shadow.mapSize.height = 512; // default is 512
scene.add( directionalLight );

// ground

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry( 2000, 2000 ),
  new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } )
);
ground.rotation.x = - Math.PI / 2;
ground.position.y = - 75;
ground.receiveShadow = true;
scene.add( ground );

// THREE.ShaderLib[ 'lambert' ].fragmentShader = THREE.ShaderLib[ 'lambert' ].fragmentShader.replace(

//     `vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;`,

//     `#ifndef CUSTOM
//         vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
//     #else
//         vec3 outgoingLight = diffuseColor.rgb * ( 1.0 - 0.3 * ( 1.0 - getShadowMask() ) ); // shadow intensity hardwired to 0.5 here
//     #endif`

// );

const material = new THREE.MeshLambertMaterial( { color: bg } );
material.defines = material.defines || {};
material.defines.CUSTOM = "";

const geometry = new THREE.PlaneGeometry( 10000, 10000, 1, 1 );
const floor = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10000, 10000 ), material );
floor.rotation.x = - Math.PI / 2;
floor.receiveShadow = true;
scene.add( floor );


const blockMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
const radius = 20;

for ( let i = 0; i < 500; i ++ ) {
  var pt_angle = Math.random() * 2 * Math.PI;
  var pt_radius_sq = Math.random() * radius * radius;
  var pt_x = Math.sqrt(pt_radius_sq) * Math.cos(pt_angle);
  var pt_y = Math.sqrt(pt_radius_sq) * Math.sin(pt_angle);
  const blockHeight = (radius - (Math.abs(pt_x) + Math.abs(pt_y)) / 2) * Math.random() * 2;
  console.log(pt_x, pt_y, "bh: ", blockHeight)
  const blockWidth = 0.2 + Math.random() * 2;
  const block = new THREE.BoxGeometry( blockWidth, blockHeight, blockWidth );
  const mesh = new THREE.Mesh( block, blockMaterial );
  mesh.position.x = pt_x;
  mesh.position.y = 0;
  mesh.position.z = pt_y;
  mesh.updateMatrix();
  mesh.matrixAutoUpdate = false;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );

}

renderer.shadowMap.enabled = true;
// renderer.shadowMapSoft = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;

// Init gui
const gui = new GUI();

gui.add( ssaoPass, 'output', {
  'Default': SSAOPass.OUTPUT.Default,
  'SSAO Only': SSAOPass.OUTPUT.SSAO,
  'SSAO Only + Blur': SSAOPass.OUTPUT.Blur,
  'Beauty': SSAOPass.OUTPUT.Beauty,
  'Depth': SSAOPass.OUTPUT.Depth,
  'Normal': SSAOPass.OUTPUT.Normal
} ).onChange( function ( value ) {

  ssaoPass.output = parseInt( value );

} );
gui.add( ssaoPass, 'kernelRadius' ).min( 0 ).max( 32 );
gui.add( ssaoPass, 'minDistance' ).min( 0.001 ).max( 0.02 );
gui.add( ssaoPass, 'maxDistance' ).min( 0.01 ).max( 0.3 );
// gui.add( directionalLight.shadow, 'radius' ).min( 1 ).max( 128 );

// const loader = new GLTFLoader();

// function doModel(path, color, diff_path) {
//   loader.load( path, function ( gltf ) {
//     const diff = new THREE.TextureLoader().load( diff_path );
//     diff.wrapS = THREE.RepeatWrapping;
//     diff.wrapT = THREE.RepeatWrapping;
//     const scale = 1.14;
//     diff.repeat.set( scale, scale );
//     const norm = new THREE.TextureLoader().load( './textures/normal.png' );
//     norm.wrapS = THREE.RepeatWrapping;
//     norm.wrapT = THREE.RepeatWrapping;
//     norm.repeat.set( 6, 6 );
//     const vect = new THREE.Vector2( 0.5, 0.5 );
//     const mat = new THREE.MeshStandardMaterial({
//       // color: color,
//       normalMap: norm,
//       normalScale: vect,
//       map: diff
//     });
//     const model = gltf.scene;
//     model.scale.set( 10, 10, 10 );
//     model.position.set( 0, 0.3, 0 );
//     model.traverse(function(o) {
//       if (o.isMesh) {
//         o.material = mat
//         o.castShadow = true;
//       }
//     });
//     scene.add( model );
//     animate();
//   }, undefined, function ( e ) {
//     console.error( e );

//   } );
// }

// doModel('./klap_frame.glb', col_main, './textures/diff_main.jpg');
// doModel('./klap_main.glb', col_main, './textures/diff_main.jpg');
// doModel('./klap_accent.glb', col_accent,'./textures/diff_accent.jpg');
let container = document.createElement( 'div' );
    document.body.appendChild( container );
let stats = new Stats();
container.appendChild( stats.dom );

window.addEventListener( 'resize', onWindowResize, false );
animate();

function animate() {

  requestAnimationFrame( animate );

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();
  stats.begin();
  renderer.render( scene, camera );
  stats.end();

}

render();
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}
function render() {

  composer.render( scene, camera );

}
