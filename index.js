import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';


const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const bg = 0x9692ff

const scene = new THREE.Scene();
scene.background = new THREE.Color( bg );

const args = [ 60, window.innerWidth / window.innerHeight, 1, 10000 ]
const camera = new THREE.PerspectiveCamera( args[0], args[1], args[2], args[3] );
camera.position.set( 1, 1, 3 );

const controls = new OrbitControls( camera, renderer.domElement );
const angle = 0;
controls.addEventListener( 'change', render ); // use if there is no animation loop
controls.target.set( 0, 0.75, 0 );
controls.update();
controls.enablePan = false;
controls.enableZoom  = false;
controls.enableDamping = true;
controls.autoRotate = true;
controls.maxPolarAngle = Math.PI / (2 - angle);
controls.minPolarAngle = Math.PI - Math.PI / (2 - angle);
controls.minPolarAngle = 0;
controls.autoRotateSpeed = 0.2;

scene.add( new THREE.HemisphereLight( 0xffffff, 0x000000, 1 ) );

const light = new THREE.DirectionalLight( 0xffffff, 0.2 );
scene.add( light );
light.position.set( 2, 4, 8 );

const shadowlight = new THREE.DirectionalLight( 0xffffff, 0 );
scene.add( shadowlight );
shadowlight.position.set( 0, 4, 3 );
shadowlight.castShadow = true;
shadowlight.shadow.radius = 8;

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
loader.load( './donit.glb', function ( gltf ) {

  var model = gltf.scene;
  model.scale.set( 10, 10, 10 );
  model.traverse(function(o) {
    if (o.isMesh) {
      o.castShadow = true;
    }
  });

  scene.add( model );

  animate();

}, undefined, function ( e ) {

  console.error( e );

} );


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