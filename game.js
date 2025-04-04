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

    // Camera Control Listeners
    renderer.domElement.addEventListener('wheel', onMouseWheel, { passive: false });
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault()); // Prevent right-click menu

    // Start animation loop
    animate();
}

// --- Camera Control Handlers ---

function onMouseWheel(event) {
    event.preventDefault(); // Prevent default page scroll

    // Adjust zoom factor smoothly
    const zoomAmount = event.deltaY * 0.001;
    camera.zoom *= (1 - zoomAmount); // Multiply for smooth zoom feel
    camera.zoom = Math.max(minZoom, Math.min(maxZoom, camera.zoom)); // Clamp zoom

    camera.updateProjectionMatrix(); // IMPORTANT! Update projection matrix after zoom change
}

function onMouseDown(event) {
    // event.button: 0=left, 1=middle, 2=right
    if (event.button === 2) { // Right mouse button for panning
        isPanning = true;
    } else if (event.button === 1 || (event.button === 0 && (keys['shift'] || keys['control']))) { // Middle button OR (Left button + Shift/Ctrl) for rotating
        isRotating = true;
    }
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
}

function onMouseMove(event) {
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;

    if (isPanning) {
        // Calculate pan speed relative to current view size
        const panFactorX = (camera.right - camera.left) / camera.zoom / renderer.domElement.clientWidth;
        const panFactorY = (camera.top - camera.bottom) / camera.zoom / renderer.domElement.clientHeight;

        // Get camera's local coordinate axes projected onto the ground plane (XZ)
        const right = new THREE.Vector3();
        camera.getWorldDirection(right).cross(camera.up).normalize(); // Camera's local X (Right)

        const forward = new THREE.Vector3(); // Direction camera is looking, projected onto ground
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        // Calculate the effective "up" direction on screen projected onto ground
        const upOnGround = new THREE.Vector3().crossVectors(right, new THREE.Vector3(0, 1, 0)).normalize();

        // Combine movements along these projected axes
        const moveX = right.multiplyScalar(-deltaX * panFactorX);
        const moveY = upOnGround.multiplyScalar(deltaY * panFactorY); // Use upOnGround for Y screen movement
        const panOffset = moveX.add(moveY);

        // Apply the pan offset to both camera position and target
        camera.position.add(panOffset);
        cameraTarget.add(panOffset);

        camera.updateMatrixWorld(); // Update camera matrix if needed elsewhere instantly
    }
    else if (isRotating) {
        const rotationFactor = 0.005; // Adjust sensitivity

        // Calculate vector from target to camera
        const offset = camera.position.clone().sub(cameraTarget);

        // Azimuthal rotation (around Y axis) based on deltaX
        const thetaDelta = -deltaX * rotationFactor;
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), thetaDelta);

        // Polar rotation (around camera's right axis) based on deltaY
        const phiDelta = -deltaY * rotationFactor;
        const rightAxis = new THREE.Vector3();
        camera.getWorldDirection(rightAxis).cross(camera.up).normalize(); // Get camera's right axis

        // Apply polar rotation and clamp to prevent flipping over
        const currentPhi = Math.acos(offset.clone().normalize().y); // Approximate current polar angle
        const maxPhi = Math.PI - 0.1; // Just shy of straight down
        const minPhi = 0.1;        // Just shy of straight up
        const newPhi = currentPhi + phiDelta;

        if (newPhi > minPhi && newPhi < maxPhi) {
             offset.applyAxisAngle(rightAxis, phiDelta);
        }

        // Update camera position
        camera.position.copy(cameraTarget).add(offset);

        // Keep looking at the target
        camera.lookAt(cameraTarget);
        camera.updateMatrixWorld();
    }

    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
}

function onMouseUp(event) {
    isPanning = false;
    isRotating = false;
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
    if (!isRotating) { // Avoid conflicting lookAt calls
        camera.lookAt(cameraTarget);
    }
}

// --- Utility ---

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;

    // Update orthographic camera frustum based on current zoom
    const currentHeight = (camera.top - camera.bottom) / camera.zoom; // Effective height
    const currentWidth = currentHeight * aspect;

    camera.left = -currentWidth / 2;
    camera.right = currentWidth / 2;
    camera.top = currentHeight / 2;
    camera.bottom = -currentHeight / 2;

    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Start the game ---
init();