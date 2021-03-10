import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import * as dat from "dat.gui";

let scene, camera, renderer, controls, loader, reticle, gui;

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

camera.position.set(3.8, 5.7, 14.5);
camera.rotation.set(-32, 25, 15);

renderer = new THREE.WebGLRenderer({ antialias: true });
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

const light = new THREE.DirectionalLight(0xffffff, 0.3);
light.position.set(5, 16, 17);
//scene.add(light);

let ChangeableObj = {
  BR1_Bulb: "Meshes/Changeable/BR1_Bulb.glb",
  BR1_Door: "Meshes/Changeable/BR1_Door.glb",
  BR1_Floor: "Meshes/Changeable/BR1_Floor.glb",
  BR1_Lamp: "Meshes/Changeable/BR1_Lamp.glb",
  BR1_Rug: "Meshes/Changeable/BR1_Rug.glb",
  BR1_Sofa: "Meshes/Changeable/BR1_Sofa.glb",
  BR1_Table: "Meshes/Changeable/BR1_Table.glb",
  BR2_BeanBag: "Meshes/Changeable/BR2_BeanBag.glb",
  BR2_BedSheet: "Meshes/Changeable/BR2_BedSheet.glb",
  BR2_Sofa: "Meshes/Changeable/BR2_Sofa.glb",
  BR2_TV: "Meshes/Changeable/BR2_TV.glb",
  LR_Bulb: "Meshes/Changeable/LR_Bulb.glb",
  LR_Clock: "Meshes/Changeable/LR_Clock.glb",
  LR_CoffeeTable: "Meshes/Changeable/LR_CoffeeTable.glb",
  LR_Couch1: "Meshes/Changeable/LR_Couch1.glb",
  LR_DiningTable: "Meshes/Changeable/LR_DiningTable.glb",
  LR_Floor: "Meshes/Changeable/LR_Floor.glb",
  LR_Lamp: "Meshes/Changeable/LR_Lamp.glb",
  LR_MidTable: "Meshes/Changeable/LR_MidTable.glb",
  LR_Rug: "Meshes/Changeable/LR_Rug.glb",
  LR_Seti: "Meshes/Changeable/LR_Seti.glb",
  LR_Sofa2: "Meshes/Changeable/LR_Sofa2.glb",
  Maindoor: "Meshes/Changeable/MainDoor.glb",
  Painting2: "Meshes/Changeable/Painting2.glb",
  Kitchen_Led: "Meshes/Changeable/Kitchen_LED5.glb",
  KitchenFloor: "Meshes/Changeable/KitchenFloor.glb",
};

let spawnedObj = [];
let isChangeableModelLoaded = false;

const loader1 = new GLTFLoader();

for (var i in ChangeableObj) {
  var load_obj = ChangeableObj[i];
  (function (index) {
    load_obj = ChangeableObj[index];
    loader1.load(
      load_obj,
      function (object) {
        let meshes = object.scene;
        meshes.traverse((child) => {
          if (child.isMesh) {
            spawnedObj.push(child);
          }
        });
        scene.add(meshes);
        isChangeableModelLoaded = true;
      },
      undefined,
      function (error) {
        console.log("An error happened");
      }
    );
  })(i);
}

var mesh;
let isUnchangeableModelLoaded = false;

loader = new GLTFLoader();
loader.load(
  "Meshes/Unchangeable/scene.glb",
  function (gltf) {
    mesh = gltf.scene;
    scene.add(mesh);
    console.log(mesh);
    isUnchangeableModelLoaded = true;
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

let currentIntersectingObj = null;
var folder1 = gui.addFolder("Visibility");

let selectedObjProp = {
  LR_Floor: (object) => {
    folder1.add(object, "visible").name(object.name);
    folder1.open();
  },

  LR_Sofa2: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  LR_DiningTable: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  LR_Lamp: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  LR_CoffeeTable: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  LR_Seti: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  LR_Bulb: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  KitchenFloor: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  Kitchen_Led: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  BR1_Door: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  BR1_Lamp: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  BR1_Table: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  BR1_Rug: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  BR1_Sofa: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  BR1_Floor: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  BR2_BeanBag: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  BR2_Sofa: (object) => {
    folder1.add(object, "visible").name(object.name);
  },
};

window.addEventListener("click", () => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  let objectsToIntersect = [spawnedObj];
  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObjects(spawnedObj);

  if (intersects.length) {
    currentIntersectingObj = intersects[0].object.parent;
    console.log(currentIntersectingObj);
  } else {
    currentIntersectingObj = null;
    console.log(currentIntersectingObj);
  }

  if (
    currentIntersectingObj &&
    currentIntersectingObj.name in selectedObjProp
  ) {
    console.log(currentIntersectingObj);
    selectedObjProp[currentIntersectingObj.name](currentIntersectingObj);
  }
});

const animate = function () {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
