import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import gsap from "gsap";
import LocomotiveScroll from "locomotive-scroll";

const scroll = new LocomotiveScroll();
const target = document.getElementsByTagName("body");
scroll.scrollTo(target);

let model;

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
);
camera.position.z = 3.5;

// Renderer
const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#canvas"),
      antialias: true,
      alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// HDRI Loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
      "./pond_bridge_night_1k.hdr",
      (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
      },
      undefined,
      (error) => console.error("An error occurred loading the HDRI:", error)
);

// GLTF Loader
const loader = new GLTFLoader();
loader.load(
      "./DamagedHelmet.gltf",
      (gltf) => {
            model = gltf.scene;
            scene.add(model);
      },
      undefined,
      (error) => console.error(error)
);

// Post-processing setup
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// RGB Shift Shader Pass
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms["amount"].value = 0.003;
composer.addPass(rgbShiftPass);

// Mouse move event
window.addEventListener("mousemove", (e) => {
      if (model) {
            const rotationX =
                  (e.clientX / window.innerWidth - 0.5) * (Math.PI * 0.1);
            const rotationY =
                  (e.clientY / window.innerHeight - 0.5) * (Math.PI * 0.1);
            gsap.to(model.rotation, {
                  x: rotationY,
                  y: rotationX,
                  duration: 1,
                  ease: "power2.out",
            });
      }
});

// Animation Loop
function animate() {
      requestAnimationFrame(animate);
      composer.render();
}

// Resize Handler
window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      composer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
