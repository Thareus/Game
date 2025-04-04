import * as THREE from 'three';
import { createTree, createRock, createFlower } from './assets.js'; // Import creators

export function populateWorld(scene, worldSize) {
    const density = 0.08; // Adjust density as needed for larger world
    const pathClearance = 3.0; // Keep slightly wider clearance

    const assetCount = Math.floor(worldSize * worldSize * density);
    console.log(`Attempting to place ${assetCount} assets...`);

    let placedCount = 0;
    for (let i = 0; i < assetCount; i++) {
        const x = (Math.random() - 0.5) * worldSize;
        const z = (Math.random() - 0.5) * worldSize;
        const position = new THREE.Vector3(x, 0, z);

        // Avoid placing assets too close to the path
        if (Math.abs(z) < pathClearance) continue;

        const assetType = Math.random();
        let asset = null;
        if (assetType < 0.5) {
            asset = createTree(position);
        } else if (assetType < 0.8) {
            asset = createRock(position);
        } else {
             asset = createFlower(position);
        }

        if (asset) {
            scene.add(asset);
            placedCount++;
        }
    }
     console.log(`Placed ${placedCount} assets.`);
}