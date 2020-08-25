import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';


const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function parseThreeColor(color) {
  return ''
}
const bg = '#d6d6d6'
const col_accent = '#ff0000'
const col_main = '#cbcbcb'

const scene = new THREE.Scene();
scene.background = new THREE.Color( bg );

const args = [ 60, window.innerWidth / window.innerHeight, 1, 10000 ]
const camera = new THREE.PerspectiveCamera( args[0], args[1], args[2], args[3] );
camera.position.set( 1, 2, 3 );


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


scene.add( new THREE.HemisphereLight( 0xffffff, 0x000000, 1 ) );

const light = new THREE.DirectionalLight( 0xffffff, 0.2 );
scene.add( light );
light.position.set( 2, 4, 8 );

const shadowlight = new THREE.DirectionalLight( 0xffffff, 0 );
scene.add( shadowlight );
shadowlight.position.set( 0, 4, 0 );
shadowlight.castShadow = true;
shadowlight.shadow.radius = 16;
shadowlight.shadow.mapSize.width = 1024;
shadowlight.shadow.mapSize.height = 1024;

THREE.ShaderLib[ 'lambert' ].fragmentShader = THREE.ShaderLib[ 'lambert' ].fragmentShader.replace(

    `vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;`,

    `#ifndef CUSTOM
        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
    #else
        vec3 outgoingLight = diffuseColor.rgb * ( 1.0 - 0.3 * ( 1.0 - getShadowMask() ) ); // shadow intensity hardwired to 0.5 here
    #endif`

);

const material = new THREE.MeshLambertMaterial( { color: bg } );
material.defines = material.defines || {};
material.defines.CUSTOM = "";

var geometry = new THREE.PlaneGeometry( 1000, 1000, 1, 1 );
var floor = new THREE.Mesh( new THREE.PlaneBufferGeometry( 100, 100 ), material );
floor.rotation.x = - Math.PI / 2;
floor.receiveShadow = true;
scene.add( floor );

renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;

const loader = new GLTFLoader();

function doModel(path, color, diff_path) {
  loader.load( path, function ( gltf ) {
    const diff = new THREE.TextureLoader().load( diff_path );
    diff.wrapS = THREE.RepeatWrapping;
    diff.wrapT = THREE.RepeatWrapping;
    const scale = 1.14;
    diff.repeat.set( scale, scale );
    const norm = new THREE.TextureLoader().load( './textures/normal.png' );
    norm.wrapS = THREE.RepeatWrapping;
    norm.wrapT = THREE.RepeatWrapping;
    norm.repeat.set( 6, 6 );
    const vect = new THREE.Vector2( 0.5, 1 );
    const mat = new THREE.MeshStandardMaterial({
      // color: color,
      normalMap: norm,
      normalScale: vect,
      map: diff
    });
    const model = gltf.scene;
    model.scale.set( 10, 10, 10 );
    model.position.set( 0, 0.3, 0 );
    model.traverse(function(o) {
      if (o.isMesh) {
        o.material = mat
        o.castShadow = true;
      }
    });
    scene.add( model );
    animate();
  }, undefined, function ( e ) {
    console.error( e );

  } );
}

doModel('./klap_main.glb', col_main, './textures/diff_main.jpg');
doModel('./klap_accent.glb', col_accent,'./textures/diff_accent.jpg');

window.addEventListener( 'resize', onWindowResize, false );

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