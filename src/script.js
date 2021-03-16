import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRButton } from "../src/VRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import gsap from "gsap";
import * as dat from "dat.gui";

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
const mouse = new THREE.Vector2();
let teleportation = false;

const tempMatrix = new THREE.Matrix4();
const intersected = [];
var floorMesh;
var kitchenFloor;
let teleportFloors = [];
let floorMeshSpawned = false;
let kitchenFloorMeshSpawned = false;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080);
gui = new dat.GUI();

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

window.addEventListener("pointerdown", () => {});

window.addEventListener("pointerup", () => {});

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
            if (child.name == "LR_FloorMesh") {
              if (!floorMeshSpawned) {
                floorMeshSpawned = true;
                spawnedObj.push(child);
                floorMesh = findObjectByKey(spawnedObj, "name", "LR_FloorMesh");
                teleportFloors.push(floorMesh);
                console.log(teleportFloors);
              }
            }
            if (child.name == "KitchenFloorMesh") {
              if (!kitchenFloorMeshSpawned) {
                kitchenFloorMeshSpawned = true;
                spawnedObj.push(child);
                kitchenFloor = findObjectByKey(
                  spawnedObj,
                  "name",
                  "KitchenFloorMesh"
                );
                teleportFloors.push(kitchenFloor);
              }
            }

            if (child.name == "mesh_290") {
              let bedroom1Door;
              bedroom1Door = child.parent.parent;
              var bedroom2Door;
              bedroom2Door = bedroom1Door.clone();
              bedroom2Door.name = "BR2_Door";
              bedroom2Door.position.set(5.918, 0.308, -6);
              scene.add(bedroom2Door);
            }

            if (child.name == "Base") {
              let Seti1;
              Seti1 = child.parent;
              var Seti2;
              Seti2 = Seti1.clone();
              Seti2.name = "LR_Seti2";
              Seti2.position.set(13.893, 0, 10.44);
              scene.add(Seti2);
            }

            if (child.name == "mesh_36_0") {
              let Couch1;
              Couch1 = child.parent;
              var Couch2;
              Couch2 = Couch1.clone();
              Couch2.name = "LR_Couch2";
              Couch2.position.set(-0.599, 1.037, 15.019);
              Couch2.rotation.y = 3.14159;
              scene.add(Couch2);
            } else {
              spawnedObj.push(child);
            }
          }
        });
        scene.add(meshes);
        //console.log(spawnedObj);
        isChangeableModelLoaded = true;
      },
      undefined,
      function (error) {
        console.log("An error happened");
      }
    );
  })(i);
}

function findObjectByKey(array, name, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][name] === value) {
      return array[i];
    }
  }
  return null;
}

var mesh;

loader = new GLTFLoader();
loader.load(
  "Meshes/Unchangeable/scene.glb",
  function (gltf) {
    mesh = gltf.scene;
    scene.add(mesh);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

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

    folder1
      .add(object.children[0].material, "metalness")
      .min(0)
      .max(1)
      .step(0.001);
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
      onUpdate: () => {},
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

window.addEventListener("pointermove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (teleportation === true) {
    raycaster.setFromCamera(mouse, camera);

    const teleportIntersects = raycaster.intersectObjects(teleportFloors);

    if (teleportIntersects[0]) {
      reticle.visible = true;
      let location = teleportIntersects[0].point;
      reticle.position.set(location.x, location.y + 0.01, location.z);
    } else {
      reticle.visible = false;
    }
  }
});

const animate = function () {
  renderer.setAnimationLoop(render);
};

function render() {
  cleanIntersected();
  intersectObjects(controller1);
  intersectObjects(controller2);
  renderer.render(scene, camera);
}
animate();
