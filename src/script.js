import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRButton } from "../src/VRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import gsap from "gsap";
import * as dat from "dat.gui";
import ThreeMeshUI from "three-mesh-ui";

let scene,
  camera,
  renderer,
  controls,
  loader,
  reticle,
  gui,
  controller1,
  controller2,
  controllerGrip1,
  controllerGrip2;
let container;
let teleportation = false;

const tempMatrix = new THREE.Matrix4();
const intersected = [];
let teleportFloors = [];

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080);
gui = new dat.GUI();

const uiContainer = new ThreeMeshUI.Block({
  height: 10,
  width: 5,
});

uiContainer.position.set(0, 1, -1.8);
uiContainer.rotation.x = -0.55;
scene.add(uiContainer);
console.log(uiContainer);

const imageBlock = new ThreeMeshUI.Block({
  height: 1,
  width: 1,
  offset: 0.1,
});

const textBlock = new ThreeMeshUI.Block({
  height: 0.4,
  width: 0.8,
  margin: 0.05,
  offset: 0.1,
});

uiContainer.add(imageBlock, textBlock);

//camera

camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

camera.position.set(2.47, 4.67, 12.47);
camera.rotation.set(0.0, 0.28, 0.0);

// let cameraHolder = new THREE.Object3D();
// cameraHolder.add(camera);
// console.log(cameraHolder);
// scene.add(cameraHolder);

//renderer

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.xr.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
let VrButton;
document.body.appendChild((VrButton = VRButton.createButton(renderer)));

//controllers

controller1 = renderer.xr.getController(0);
controller1.addEventListener("selectstart", onSelectStart);
controller1.addEventListener("selectend", onSelectEnd);
scene.add(controller1);

controller2 = renderer.xr.getController(1);
controller2.addEventListener("selectstart", onSelectStart);
controller2.addEventListener("selectend", onSelectEnd);
scene.add(controller2);

const controllerModelFactory = new XRControllerModelFactory();

controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.add(
  controllerModelFactory.createControllerModel(controllerGrip1)
);
scene.add(controllerGrip1);

controllerGrip2 = renderer.xr.getControllerGrip(1);
controllerGrip2.add(
  controllerModelFactory.createControllerModel(controllerGrip2)
);
scene.add(controllerGrip2);

const geometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -1),
]);

const line = new THREE.Line(geometry);
line.name = "line";
line.scale.z = 5;

controller1.add(line.clone());
controller2.add(line.clone());

// VrButton.addEventListener("VREntered", () => {
//   cameraHolder.position.set(1.31, -1.57, -0.55);
//   cameraHolder.rotation.set(0.0, 0.28, 0.0);
// });

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
light.position.set(0, 6, 0);
light.castShadow = true;
light.shadow.camera.top = 2;
light.shadow.camera.bottom = -2;
light.shadow.camera.right = 2;
light.shadow.camera.left = -2;
light.shadow.mapSize.set(4096, 4096);
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
reticle = new THREE.Mesh(
  new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({ color: "blue" })
);
reticle.visible = false;
scene.add(reticle);

let currentIntersectingObj = null;
var folder1 = gui.addFolder("Visibility");
folder1.open();

let selectedObjProp = {
  LR_Floor: (object) => {
    folder1.add(object, "visible").name(object.name);
    // if (object.visible === false) {
    //   scene.remove(object.parent);
    //   console.log("Removed");
    // }
  },

  LR_Sofa2: (object) => {
    folder1.add(object, "visible").name(object.name);
  },

  LR_Couch1: (object) => {
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

  BR1_Bulb: (object) => {
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

  if (reticle.visible) {
    let currentLocation = camera.position;
    let targetLocation = new THREE.Vector3(
      reticle.position.x,
      camera.position.y,
      reticle.position.z
    );

    gsap.to(camera.position, 2, {
      x: targetLocation.x,
      y: currentLocation.y,
      z: targetLocation.z,
      onUpdate: () => {
        // camera.updateProjectionMatrix();
      },
    });

    controls.target.set(targetLocation.x, currentLocation.y, targetLocation.z);

    controls.update();
  }

  //MouseRaycasting
  raycaster.setFromCamera(mouse, camera);

  if (teleportation === false) {
    let intersects = raycaster.intersectObjects(spawnedObj);

    if (intersects.length) {
      currentIntersectingObj = intersects[0].object.parent;
      console.log(currentIntersectingObj);

      // camera.lookAt(
      //   intersects[0].object.position.x,
      //   intersects[0].object.position.y + 1,
      //   intersects[0].object.position.z - 0.1
      // );
      // camera.updateProjectionMatrix();

      // console.log(camera.position);
    } else {
      currentIntersectingObj = null;
    }

    if (
      currentIntersectingObj &&
      currentIntersectingObj.name in selectedObjProp
    ) {
      //console.log(currentIntersectingObj);
      selectedObjProp[currentIntersectingObj.name](currentIntersectingObj);
    }
  } else {
    const teleportIntersects = raycaster.intersectObjects(spawnedObj);

    if (teleportIntersects[0]) {
      reticle.visible = true;
      let location = teleportIntersects[0].point;
      reticle.position.set(location.x, location.y + 0.01, location.z);
    } else {
      reticle.visible = false;
    }
  }
});

//VRControllerEvents

function onSelectStart(event) {
  const controller = event.target;

  const intersections = getIntersections(controller);

  if (intersections.length > 0) {
    const intersection = intersections[0];

    const object = intersection.object.parent;
    controller.attach(object);
    console.log(object);
    // const container = new ThreeMeshUI.Block({
    //   height: 1.5,
    //   width: 1,
    // });

    // container.position.set(
    //   object.position.x,
    //   object.position.y + 1,
    //   object.position.z
    // );
    // container.rotation.x = -0.55;
    // scene.add(container);

    // const imageBlock = new ThreeMeshUI.Block({
    //   height: 1,
    //   width: 1,
    //   offset: 0.1,
    // });

    // const textBlock = new ThreeMeshUI.Block({
    //   height: 0.4,
    //   width: 0.8,
    //   margin: 0.05,
    //   offset: 0.1,
    // });

    // container.add(imageBlock, textBlock);
    // console.log(container.position);

    controller.userData.selected = object;
    console.log(controller.userData.selected);
  }
}

function onSelectEnd(event) {
  const controller = event.target;

  if (controller.userData.selected !== undefined) {
    const object = controller.userData.selected;
    scene.attach(object);

    controller.userData.selected = undefined;
    console.log(controller.userData.selected);
  }
}

//ControllerRaycasting

function getIntersections(controller) {
  tempMatrix.identity().extractRotation(controller.matrixWorld);

  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

  return raycaster.intersectObjects(spawnedObj);
}

function intersectObjects(controller) {
  if (controller.userData.selected !== undefined) return;

  const line = controller.getObjectByName("line");
  const intersections = getIntersections(controller);

  if (intersections.length > 0) {
    const intersection = intersections[0];

    const object = intersection.object.parent;
    intersected.push(object);

    line.scale.z = intersection.distance;
  } else {
    line.scale.z = 5;
  }
}

function cleanIntersected() {
  while (intersected.length) {
    const object = intersected.pop();
  }
}

const animate = function () {
  ThreeMeshUI.update();
  renderer.setAnimationLoop(render);
};

function render() {
  cleanIntersected();
  intersectObjects(controller1);
  intersectObjects(controller2);
  renderer.render(scene, camera);
}
animate();
