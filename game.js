import * as THREE from 'three';

let scene, camera, renderer, player, clock;
const keys = {}; // Keep track of pressed keys
const moveSpeed = 5;
const worldSize = 50; // Size of the area where assets are placed

// --- Initialization ---
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.Fog(0x87CEEB, worldSize * 0.8, worldSize * 1.5); // Add fog for depth

    // Clock for delta time
    clock = new THREE.Clock();

    // Camera (Orthographic for the flat/isometric look)
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 25; // Controls the zoom level
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
    );
    camera.position.set(15, 15, 15); // Angled top-down view
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xaaaaaa); // Soft ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    // Configure shadow properties for performance/quality
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -worldSize / 2;
    directionalLight.shadow.camera.right = worldSize / 2;
    directionalLight.shadow.camera.top = worldSize / 2;
    directionalLight.shadow.camera.bottom = -worldSize / 2;
    scene.add(directionalLight);
    // Optional: Add a light helper
    // const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
    // scene.add(lightHelper);
    // const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // scene.add(shadowHelper);


    // Ground
    const groundGeometry = new THREE.PlaneGeometry(worldSize, worldSize);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90ee90 }); // Light green
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be flat
    ground.receiveShadow = true;
    scene.add(ground);

    // Path
    const pathWidth = 3;
    const pathGeometry = new THREE.PlaneGeometry(worldSize, pathWidth);
    const pathMaterial = new THREE.MeshLambertMaterial({ color: 0xd2b48c }); // Tan
    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.01; // Slightly above ground to prevent z-fighting
    path.receiveShadow = true;
    scene.add(path);

    // Player Character Placeholder
    player = createPlayer();
    player.position.set(0, 0.75, 0); // Start position slightly elevated
    scene.add(player);

    // Procedural Asset Placement
    populateWorld();

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