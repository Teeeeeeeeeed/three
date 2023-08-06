import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export enum ModelNames {
    PreMining = 'Pre-Mining',
    Mining = 'Mining'
}

export interface Model {
    name: ModelNames;
    assets: string[];
    scene?:GLTF[];
}

export const maps = new Map<ModelNames, Model>([
    [
        ModelNames.Mining,
        {
            name: ModelNames.Mining,
            assets:[
            'assets/3d-assets/Terrain_Year16.gltf',
            'assets/3d-assets/Mining_Facilities.gltf',
            'assets/3d-assets/Terrain_Outer.gltf'
            ],
            scene:[]
        }
    ],
    [
        ModelNames.PreMining,
        {
            name: ModelNames.PreMining,
            assets:[
            'assets/3d-assets/Terrain_Existing.gltf', 
            'assets/3d-assets/Terrain_Outer.gltf'
        ],
        scene:[]
    }
    ]
])