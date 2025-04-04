import * as THREE from 'three';

// --- Asset Creation Functions ---

export function createTree(position) {
    const tree = new THREE.Group();

    // Trunk
    const trunkHeight = Math.random() * 1.5 + 1.5; // Slightly larger trees perhaps
    const trunkRadius = 0.25;
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 6);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = false; // Trunk probably doesn't receive much shadow from canopy
    tree.add(trunk);

    // Canopy
    const canopyRadius = Math.random() * 0.8 + 1.0;
    const canopyGeometry = new THREE.IcosahedronGeometry(canopyRadius, 0);
    const canopyMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Forest green
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.y = trunkHeight + canopyRadius * 0.5; // Adjusted position
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    canopy.rotation.y = Math.random() * Math.PI * 2;
    canopy.rotation.x = Math.random() * 0.2 - 0.1;
    canopy.rotation.z = Math.random() * 0.2 - 0.1;
    tree.add(canopy);

    tree.position.copy(position);
    tree.position.y = 0;
    tree.scale.setScalar(Math.random() * 0.4 + 0.8);

    return tree;
}

export function createRock(position) {
    const rockSize = Math.random() * 0.8 + 0.4; // Slightly larger rocks
    const rockGeometry = new THREE.DodecahedronGeometry(rockSize, 0);
    const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 }); // Slate grey
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);

    rock.position.copy(position);
    rock.position.y = rockSize / 2.5; // Adjust base slightly
    rock.rotation.x = Math.random() * Math.PI;
    rock.rotation.y = Math.random() * Math.PI;
    rock.castShadow = true;
    rock.receiveShadow = true;
    rock.scale.setScalar(Math.random() * 0.5 + 0.7); // Add scale variation

    return rock;
}

export function createFlower(position) {
    const flower = new THREE.Group();

    // Stem
    const stemHeight = 0.3;
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, stemHeight, 5);
    const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x32CD32 }); // Lime green
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = stemHeight / 2;
    stem.castShadow = true;
    flower.add(stem);

    // Head
    const headRadius = 0.1;
    const headGeometry = new THREE.SphereGeometry(headRadius, 5, 4); // Low segments
    const colors = [0xff6347, 0xffd700, 0xee82ee, 0x6495ED]; // Added CornflowerBlue
    const headMaterial = new THREE.MeshLambertMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = stemHeight + headRadius * 0.8;
    head.castShadow = true;
    flower.add(head);

    flower.position.copy(position);
    flower.position.y = 0;

    return flower;
}

export function createPlayer() {
    const playerGroup = new THREE.Group();

    // Body
    const bodyHeight = 0.8;
    const bodyRadius = 0.3;
    const bodyGeometry = new THREE.CapsuleGeometry(bodyRadius, bodyHeight - bodyRadius * 2, 4, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4682B4 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = bodyHeight / 2;
    body.castShadow = true;
    playerGroup.add(body);

    // Head
    const headRadius = 0.25;
    const headGeometry = new THREE.SphereGeometry(headRadius, 12, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE4C4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = bodyHeight + headRadius * 0.8;
    head.castShadow = true;
    playerGroup.add(head);

    // Hat
    const hatRadius = headRadius * 1.1;
    const hatGeometry = new THREE.SphereGeometry(hatRadius, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    const hatMaterial = new THREE.MeshLambertMaterial({ color: 0xFF8C00 });
    const hat = new THREE.Mesh(hatGeometry, hatMaterial);
    hat.position.y = head.position.y + headRadius * 0.1;
    hat.scale.y = 0.8;
    hat.castShadow = true;
    playerGroup.add(hat);

    // Stick
    const stickGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5);
    const stickMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const stick = new THREE.Mesh(stickGeometry, stickMaterial);
    stick.position.set(bodyRadius * 0.9, bodyHeight * 0.4, bodyRadius * 0.5);
    stick.rotation.z = Math.PI / 4;
    stick.rotation.x = -Math.PI / 6;
    stick.castShadow = true;
    playerGroup.add(stick);

    return playerGroup;
}