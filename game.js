import * as THREE from 'three';
// Import the refactored functions
import { createPlayer } from './assets.js';
import { populateWorld } from './world.js';

let scene, camera, renderer, player, clock;
const keys = {}; // Keep track of pressed keys
const moveSpeed = 5;
const worldSize = 150; // Size of the area where assets are placed

// Camera control variables
let cameraTarget = new THREE.Vector3(0, 0, 0); // Point camera looks at
let isPanning = false;
let isRotating = false;
let previousMousePosition = { x: 0, y: 0 };
const minZoom = 0.3; // Min camera zoom factor
const maxZoom = 5.0; // Max camera zoom factor
const panSpeed = 0.5;
const rotateSpeed = 0.01; // Radians per pixel

// --- Initialization ---
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.Fog(0x87CEEB, worldSize * 0.6, worldSize * 1.2); // Add fog for depth

    // Clock for delta time
    clock = new THREE.Clock();

    // Camera (Orthographic for the flat/isometric look)
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 40; // Controls the zoom level
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
    );
    camera.position.set(40, 40, 40); // Angled top-down view
    camera.zoom = 1.0; // Default zoom level
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.8); // Slightly less intensity
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8); // Slightly more intensity
    directionalLight.position.set(worldSize * 0.2, worldSize * 0.5, worldSize * 0.1); // Position relative to world size
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048; // Higher res for larger area
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = worldSize * 1.5; // Increase shadow camera range
    // Adjust shadow frustum to cover more area (might need tweaking)
    const shadowCamSize = worldSize * 0.7;
    directionalLight.shadow.camera.left = -shadowCamSize;
    directionalLight.shadow.camera.right = shadowCamSize;
    directionalLight.shadow.camera.top = shadowCamSize;
    directionalLight.shadow.camera.bottom = -shadowCamSize;
    scene.add(directionalLight);
    // scene.add(new THREE.CameraHelper(directionalLight.shadow.camera)); // Optional: Debug shadow camera

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(worldSize, worldSize);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90ee90 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Player Character Placeholder
    player = createPlayer();
    player.position.set(0, 0.75, 0); // Start position slightly elevated
    scene.add(player);

    // Procedural Asset Placement
    populateWorld(scene, worldSize);

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', (event) => { keys[event.key.toLowerCase()] = true; });
    document.addEventListener('keyup', (event) => { keys[event.key.toLowerCase()] = false; });

    // Start animation loop
    animate();
}

// --- Animation & Updates ---

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta(); // Time since last frame

    handleInput(delta);

    // Make camera follow player smoothly (optional)
    // const targetPosition = player.position.clone().add(new THREE.Vector3(15, 15, 15));
    // camera.position.lerp(targetPosition, 0.1);
    // camera.lookAt(player.position);

    renderer.render(scene, camera);
}

function handleInput(delta) {
    const moveDistance = moveSpeed * delta;
    let moveX = 0;
    let moveZ = 0;

    if (keys['w'] || keys['arrowup']) {
        moveZ -= moveDistance;
    }
    if (keys['s'] || keys['arrowdown']) {
        moveZ += moveDistance;
    }
    if (keys['a'] || keys['arrowleft']) {
        moveX -= moveDistance;
    }
    if (keys['d'] || keys['arrowright']) {
        moveX += moveDistance;
    }

    if (moveX !== 0 || moveZ !== 0) {
        const moveVector = new THREE.Vector3(moveX, 0, moveZ);

        // Rotate player to face movement direction
        const angle = Math.atan2(moveVector.x, moveVector.z);
        player.rotation.y = angle;

        // Apply movement
        player.position.add(moveVector);

        // Basic boundary check
        const halfWorld = worldSize / 2;
        player.position.x = Math.max(-halfWorld, Math.min(halfWorld, player.position.x));
        player.position.z = Math.max(-halfWorld, Math.min(halfWorld, player.position.z));
    }
}

// --- Utility ---

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 25;

    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Start the game ---
init();