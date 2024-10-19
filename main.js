import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
);
camera.position.z = 3.5;

// Renderer
const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#canvas"), // Canvas selector
      antialias: true, // Enable antialiasing here
      alpha: true, // Enable transparency
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Retina display fix
renderer.setSize(window.innerWidth, window.innerHeight);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable damping (inertia)

// HDRI Loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
      "./pond_bridge_night_1k.hdr", // Replace with the path to your HDRI file
      (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
            // scene.background = texture;
      },
      undefined,
      function (error) {
            console.error("An error occurred loading the HDRI:", error);
      }
);

// GLTF Loader
const loader = new GLTFLoader();
loader.load(
      "./DamagedHelmet.gltf",
      (gltf) => {
            const model = gltf.scene;
            scene.add(model);
      },
      undefined,
      function (error) {
            console.error(error);
      }
);

// Post-processing setup
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// RGB Shift Shader Pass
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms["amount"].value = 0.0030; // Adjust the amount of RGB shift
composer.addPass(rgbShiftPass);

// Animation Loop
function animate() {
      window.requestAnimationFrame(animate); // Loop the render process

      // Update controls
      controls.update();

      // Render the scene with post-processing
      composer.render();
}

// Resize Handler to adjust canvas size on window resize
window.addEventListener("resize", () => {
      // Update camera aspect ratio and projection matrix
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Update renderer size
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Update composer size
      composer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
