import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRM, VRMUtils } from '@pixiv/three-vrm';

const vrmFilePath='./static/test.vrm';

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

// camera
const camera = new THREE.PerspectiveCamera( 30.0, window.innerWidth / window.innerHeight, 0.1, 20.0 );
camera.position.set( 0.0, 1.0, 5.0 );

// camera controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.screenSpacePanning = true;
controls.target.set( 0.0, 1.0, 0.0 );
controls.update();

// scene
const scene = new THREE.Scene();

// light
const light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 1.0, 1.0, 1.0 ).normalize();
scene.add( light );

// gltf and vrm
const loader = new GLTFLoader();
loader.crossOrigin = 'anonymous';
loader.load(
    // URL of the VRM you want to load
    vrmFilePath,
    // called when the resource is loaded
    ( gltf ) => {
        // calling this function greatly improves the performance
        VRMUtils.removeUnnecessaryJoints( gltf.scene );
        // generate VRM instance from gltf
        VRM.from( gltf ).then( ( vrm ) => {
            console.log( vrm );
            scene.add( vrm.scene );
            vrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Hips ).rotation.y = Math.PI;
        } );
    },
    // called while loading is progressing
    ( progress ) => console.log( 'Loading model...', 100.0 * ( progress.loaded / progress.total ), '%' ),
    // called when loading has errors
    ( error ) => console.error( error )
);

// helpers
const gridHelper = new THREE.GridHelper( 10, 10 );
scene.add( gridHelper );

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

animate();


// const scene = new THREE.Scene();

// const loader = new GLTFLoader();
// loader.load(

// 	// URL of the VRM you want to load
// 	'./static/test.vrm',

// 	// called when the resource is loaded
// 	( gltf ) => {

// 		// generate a VRM instance from gltf
// 		VRM.from( gltf ).then( ( vrm ) => {

// 			// add the loaded vrm to the scene
// 			scene.add( vrm.scene );

// 			// deal with vrm features
// 			console.log( vrm );

// 		} );

// 	},

// 	// called while loading is progressing
// 	( progress ) => console.log( 'Loading model...', 100.0 * ( progress.loaded / progress.total ), '%' ),

// 	// called when loading has errors
// 	( error ) => console.error( error )

// );