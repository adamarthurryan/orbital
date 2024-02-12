import * as THREE from 'three';

import bodies from './src/bodies.js';

import getTenPcStars from './src/the10pcsample.js';
let tenPcStars = await getTenPcStars();
console.log(tenPcStars);

const renderer = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const SCENE_WIDTH = window.innerWidth;

init();

function init() {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera( 5, window.innerWidth / window.innerHeight, 1e10, 1e30 );

    const boom = new THREE.Group();
    boom.add(camera);
    scene.add(boom);

    camera.position.set( 0, 0, 1e16 );
    camera.lookAt( 0, 0, 0 );

    let bodyMeshes = bodies.map(body => ({body, mesh:createSphere(body.radius, body.position, 0xffffff)}));


    for (const {_, mesh} of bodyMeshes) {
        scene.add(mesh);
    }

    function animate() {
        requestAnimationFrame( animate );

        renderer.render( scene, camera );
    }

    //rotate the camera when the mouse is dragged
    function mouseMoveListener(event) {
        const buttons = event.buttons;
        const right = buttons & 2;

        if (right) {
            const dx = event.movementX;
            const dy = event.movementY;
            boom.rotation.y += dy/100;
            boom.rotation.z += dx/100;
        }
    }

    function mouseWheelListener(event) {
        //camera.position.z +=event.deltaY/500;
        camera.fov*=1-event.deltaY/300;
        if (camera.fov > 90) camera.fov = 90;
    
        const vFOV = camera.fov * Math.PI / 180;        // convert vertical fov to radians
        const height = 2 * Math.tan( vFOV / 2 ) * camera.position.z; // visible height

        //scale each body so that it can be seen
        for (const {body, mesh} of bodyMeshes) { 
    

            const fractionOfView = body.radius *2 / height
            const visibleWidth = SCENE_WIDTH * fractionOfView;
            const minFraction = 4/SCENE_WIDTH;
            const minRadius = minFraction*height/2;
                    
            if (minRadius > body.radius) {
                mesh.scale.set(minRadius/body.radius, minRadius/body.radius, minRadius/body.radius);
            }
            else {
                mesh.scale.set(1, 1, 1);
            }
        }
    
        camera.updateProjectionMatrix();
    };

    document.addEventListener('mousewheel', mouseWheelListener);
    document.addEventListener('mousemove', mouseMoveListener);
    animate();
    
}


function createSphere(radius, position, color) {
    const geo = new THREE.SphereGeometry(radius, 16, 16);
    const mat = new THREE.MeshBasicMaterial( { color: color } );
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(position.x, position.y, position.z);
    return mesh;
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

