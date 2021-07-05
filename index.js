import * as THREE from "https://cdn.skypack.dev/three";
import { OrbitControls } from "https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "https://cdn.skypack.dev/three/examples/jsm/libs/dat.gui.module.js";
import Stats from "https://cdn.skypack.dev/three/examples/jsm/libs/stats.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "https://cdn.skypack.dev/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.skypack.dev/three/examples/jsm/postprocessing/RenderPass.js";
import { SSAOPass } from "https://cdn.skypack.dev/three/examples/jsm/postprocessing/SSAOPass.js";
import { FilmPass } from "https://cdn.skypack.dev/three/examples/jsm/postprocessing/FilmPass.js";
import { BloomPass } from "https://cdn.skypack.dev/three/examples/jsm/postprocessing/BloomPass.js";
import { CinematicCamera } from 'https://cdn.skypack.dev/three/examples/jsm/cameras/CinematicCamera.js';
import * as TWEEN from 'https://cdn.skypack.dev/@tweenjs/tween.js';

let container, stats;
let camera, lights, scene, renderer, clock;
let composer;
let group;
let controls;
let renderPass, ssaoPass, bloomPass, filmPass;

// colors
const bg = "#fff";
const col_accent = "#ff0000";
const col_main = "#cbcbcb";

init();
animate();

// scene
function createScene() {
  container = document.createElement("div");
  document.body.appendChild(container);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const args = [60, window.innerWidth / window.innerHeight, 1, 10000];
  camera = new CinematicCamera(args[0], args[1], args[2], args[3]);
  camera.setLens( 15, camera.frameHeight, 1, camera.cbc );
  camera.position.set(100, 200, 300);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(bg);
  scene.fog = new THREE.FogExp2(bg, 0.003);
}
function createOrbit() {
  // orbitcontrols
  controls = new OrbitControls(camera, renderer.domElement);
  const angle = 0;
  // controls.addEventListener( 'change', render ); // use if there is no animation loop
  controls.target.set(0, 1, 0);
  controls.update();
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.05;
  controls.maxPolarAngle = Math.PI / (2 - angle);
  // controls.minPolarAngle = Math.PI - Math.PI / (2 - angle);
  controls.minPolarAngle = 0;
  // window.onmousemove = logMouseMove;
}

window.changeOrbit = changeOrbit;
function changeOrbit(xPos,yPos,zPos,xTarget,yTarget,zTarget) {
  const coords = {x: camera.position.x, y: camera.position.y, z: camera.position.z}
  const newCoords = {x: xPos, y: yPos, z: zPos}
  const target = {x: controls.target.x, y: controls.target.y, z: controls.target.z}
  const newTarget = {x: xTarget, y: yTarget, z: zTarget}
  new TWEEN.Tween(coords)
      .to({ x: newCoords.x, y: newCoords.y, z: newCoords.z})
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() =>
        camera.position.set(coords.x, coords.y, coords.z)
      )
      .start();
  new TWEEN.Tween(target)
      .to({ x: newTarget.x, y: newTarget.y, z: newTarget.z})
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() =>
        controls.target.set(target.x, target.y, target.z)
      )
      .start();
  controls.update();
}

function createLights() {
  lights = {
    directionalStrength: 1.12,
    hemiStrength: 0.5,
    shadowMapSize: 2*512,
    shadowRadius: 4,
    d: 220
  };

  const hemiLight = new THREE.HemisphereLight(0xddddff, 0x444444, lights.hemiStrength);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  const d = lights.d;
  const directionalLight = new THREE.DirectionalLight(0xddddff, lights.directionalStrength);
  directionalLight.position.set(100, 80, 100);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = - d;
  directionalLight.shadow.camera.right = d;
  directionalLight.shadow.camera.top = d;
  directionalLight.shadow.camera.bottom = - d;
  directionalLight.shadow.radius = lights.shadowRadius;
  directionalLight.shadow.mapSize.width = lights.shadowMapSize; // default is 512
  directionalLight.shadow.mapSize.height = lights.shadowMapSize; // default is 512
  scene.add(directionalLight);
}

function createFloor() {
  // floor
  group = new THREE.Group();
  scene.add(group);

  const material = new THREE.MeshLambertMaterial({ color: bg });
  const floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(10000, 10000), material);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
}

function createCity() {
  // city
  const blockMaterial = new THREE.MeshLambertMaterial({ color: bg });
  const radius = 220;

  for (let i = 0; i < 500; i++) {
    var pt_angle = Math.random() * 2 * Math.PI;
    var pt_radius_sq = Math.random() * radius * radius;
    var pt_x = Math.sqrt(pt_radius_sq) * Math.cos(pt_angle);
    var pt_y = Math.sqrt(pt_radius_sq) * Math.sin(pt_angle);
    const blockHeight = (radius - (Math.abs(pt_x) + Math.abs(pt_y)) / 2) * Math.random() * 2;
    // console.log(pt_x, pt_y, "bh: ", blockHeight)
    const blockWidth = 0.2 + Math.random() * 20;
    const block = new THREE.BoxGeometry(blockWidth, blockHeight, blockWidth);
    const mesh = new THREE.Mesh(block, blockMaterial);
    mesh.position.x = pt_x;
    mesh.position.y = 0;
    mesh.position.z = pt_y;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
}
function doPost() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // post processing

  composer = new EffectComposer(renderer);

  renderPass = new RenderPass( scene, camera );
  composer.addPass( renderPass );

  ssaoPass = new SSAOPass(scene, camera, width, height);
  ssaoPass.kernelRadius = 0.8
  ssaoPass.minDistance = 0.001;
  ssaoPass.maxDistance = 0.005;
  composer.addPass(ssaoPass);

  bloomPass = new BloomPass(
    1.6, // strength
    0,8, // kernel size
    0.1, // sigma ?
    512 // blur render target resolution
  );
  // composer.addPass(bloomPass);

  filmPass = new FilmPass(
    0.1, // noise intensity
    0.025, // scanline intensity
    648, // scanline count
    false // grayscale
  );
  filmPass.renderToScreen = true;
  composer.addPass(filmPass);

}

function doStats() {
  // gui & stats
  stats = new Stats();
  container.appendChild(stats.dom);
}
function init() {
  createScene();
  createOrbit();
  createLights();
  createFloor();
  createCity();
  doPost();
  doStats();
  window.addEventListener( 'resize', onWindowResize, false );
  animate();
}
function logMouseMove(event) {
  const multiplier = 0.6;
  let e = event || window.event;
  let speed = -(document.body.clientWidth / 2 - e.clientX) / document.body.clientWidth;
  controls.autoRotateSpeed = speed * multiplier;
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);
}

function animate(time) {
  requestAnimationFrame(animate);
  controls.update();
  stats.begin();
  render();
  stats.end();
  TWEEN.update(time);
}

function render() {
  renderer.shadowMap.enabled = true;
  composer.render();
}
