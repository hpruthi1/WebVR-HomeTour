import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import * as dat from "dat.gui";

let scene, camera, renderer, controls, loader, raycaster, reticle, gui;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

scene = new THREE.Scene();
gui = new dat.GUI();

camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

camera.position.set(10, 0, 7);

renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

var mesh;
let isModelLoaded = false;
let objectsToIntersect = [];
const guiPosFolder = gui.addFolder("Living Room");

loader = new GLTFLoader();
loader.load(
  "Final.glb",
  function (gltf) {
    mesh = gltf.scene;
    scene.add(mesh);
    console.log(mesh);
    isModelLoaded = true;

    //Adding Living Room Floor to ObjectstoIntersect
    if (
      mesh.children[0].children[0].children[2].children[0].children[14].name ==
      "mesh_0"
    ) {
      objectsToIntersect.push(
        mesh.children[0].children[0].children[2].children[0].children[14]
      );
    }
    console.log(objectsToIntersect);

    //Adding Living Room floor to dat.gui
    if (isModelLoaded) {
      guiPosFolder
        .add(
          mesh.children[0].children[0].children[2].children[0].children[14]
            .material,
          "roughness"
        )
        .name("Floor Roughness")
        .min(0)
        .max(1)
        .step(0.1);

      guiPosFolder.open();
    }
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

const light = new THREE.DirectionalLight(0xffffff, 0.3);
light.position.set(5, 16, 17);
scene.add(light);

const animate = function () {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
