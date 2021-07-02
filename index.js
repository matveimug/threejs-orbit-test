import * as THREE from 'https://cdn.skypack.dev/three'
import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';


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


const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
hemiLight.position.set( 0, 200, 0 );
scene.add( hemiLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 0, 200, 100 );
directionalLight.castShadow = true;
directionalLight.shadow.camera.top = 180;
directionalLight.shadow.camera.bottom = - 100;
directionalLight.shadow.camera.left = - 120;
directionalLight.shadow.camera.right = 120;
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
const citySize = 40;

for ( let i = 0; i < 500; i ++ ) {
  const blockHeight = Math.random() * 20;
  const blockWidth = Math.random() * 2;
  const block = new THREE.BoxGeometry( blockWidth, blockHeight, blockWidth );
  const mesh = new THREE.Mesh( block, blockMaterial );
  mesh.position.x = Math.random() * citySize - citySize/2;
  mesh.position.y = 0;
  mesh.position.z = Math.random() * citySize - citySize/2;
  mesh.updateMatrix();
  mesh.matrixAutoUpdate = false;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );

}

renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;

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

window.addEventListener( 'resize', onWindowResize, false );
animate();

function animate() {

  requestAnimationFrame( animate );

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();

  renderer.render( scene, camera );

}

render();
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  render();

}
function render() {

  renderer.render( scene, camera );

}
