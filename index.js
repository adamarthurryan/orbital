import * as THREE from 'three';

import bodies from './src/bodies.js';

const renderer = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const SCENE_WIDTH = window.innerWidth;

init();

function init() {
    const scene = new THREE.Scene();

    let containerEl = document.getElementById( 'threejs' );
    renderer.setPixelRatio( window.devicePixelRatio );
    //containerEl.appendChild( renderer.domElement );


    const camera = new THREE.PerspectiveCamera( 5, window.innerWidth / window.innerHeight, 1e10, 1e30 );

    const raycaster = new THREE.Raycaster();

    const boom = new THREE.Group();
    boom.add(camera);
    scene.add(boom);

    camera.position.set( 0, 0, 1e16 );
    camera.lookAt( 0, 0, 0 );

    const meshBodyMap = new WeakMap;
    for (const body of bodies) {
        if (body.mesh) {
            scene.add(body.mesh);
            meshBodyMap.set(body.mesh,body); 
        }
    }

    //time factor in days per second
    let timeFactor = 1.0;
    let secLast=new Date().getTime()/1000;
    let t = 0;

    let timeEl = document.getElementById('time');
    let objectNameEl = document.getElementById('object-name');

    //initialize the pointer to be off screen
    let pointer = new THREE.Vector2(-10000,-10000);

    rescaleAlwaysVisibleBodies();

    let intersectedBody = null;
    let focusedBody = null;

    function animate() {
        let secNext = new Date().getTime()/1000;
        let interval = secNext - secLast;
        t+=timeFactor*interval;
        secLast=secNext;

        timeEl.textContent=toTimeString(t);

        if (focusedBody)
            camera.lookAt(focusedBody.mesh.position);

        //update body positions
        for (const body of bodies) {
            if (body.mesh) {
                const position = body.position(t);
                body.mesh.position.set(position.x, position.y, position.z);    
            }
        }

        //find intersections
        intersectedBody = findIntersectedBody();
        if (intersectedBody) {
            objectNameEl.textContent = intersectedBody.name;
        }

        requestAnimationFrame( animate );

        renderer.render( scene, camera );
    }

    //find intersections
    function findIntersectedBody() {
        const V2 = THREE.Vector2;
        let offsets = [
            new V2(-2,-2), new V2(-2,0), new V2(-2,2),
            new V2(0,-2), new V2(0,0), new V2(0,2),
            new V2(2,-2), new V2(2,0), new V2(2,2),
        ];

        for (const offset of offsets) {
            raycaster.setFromCamera( pointer.add(offset), camera );
            const intersects = raycaster.intersectObjects(scene.children, false );

            if ( intersects.length > 0 ) {
                console.log("hit");
                let body = meshBodyMap.get(intersects[0].object);
                return body;
            }    
        }
        return null;
    }

    //focused the clicked item
    function onMouseDown(event) {
        if (intersectedBody) {
            focusedBody=intersectedBody;
            console.log(focusedBody);
        }
    }

    //rotate the camera when the mouse is dragged
    function onMouseMove(event) {
        //update the pointer position
        pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        const buttons = event.buttons;
        const right = buttons & 2;

        if (right) {
            const dx = event.movementX;
            const dy = event.movementY;
            boom.rotation.y += dy/100;
            boom.rotation.z += dx/100;
        }

        return false;
    }

    function onMouseWheel(event) {
        //camera.position.z +=event.deltaY/500;
        camera.fov*=1-event.deltaY/300;
        if (camera.fov > 90) camera.fov = 90;
    
        rescaleAlwaysVisibleBodies();
        camera.updateProjectionMatrix();
    }

    function rescaleAlwaysVisibleBodies() {
        const vFOV = camera.fov * Math.PI / 180;        // convert vertical fov to radians
        const height = 2 * Math.tan( vFOV / 2 ) * camera.position.z; // visible height

        //scale each body so that it can be seen
        for (const body of bodies.filter(({alwaysVisible, mesh, radius}) => alwaysVisible && mesh && radius)) { 

            
            const fractionOfView = body.radius *2 / height
            const visibleWidth = SCENE_WIDTH * fractionOfView;
            const minFraction = 4/SCENE_WIDTH;
            const minRadius = minFraction*height/2;
                    
            if (minRadius > body.radius) {
                body.mesh.scale.set(minRadius/body.radius, minRadius/body.radius, minRadius/body.radius);
            }
            else {
                body.mesh.scale.set(1, 1, 1);
            }
        }
    }

    function onKeyPress(event) {
        if (event.key === ',') {
            timeFactor /= 1.5;
        }
        else if ( event.key === '.') {
            timeFactor *= 1.5;
        }
        else if ( event.key === '/') {
            timeFactor *= -1;
        }
        else if (event.key === 'a' || event.key === 'd') {
            let dy = 0 + (event.key==='a' ? -5 : 5); 
            boom.rotation.y += dy/100;
        }

        else if (event.key === 's' || event.key === 'w') {
            let dx = 0 + (event.key==='s' ? -5 : 5); 
            boom.rotation.x += dx/100;
        }
    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );
    }


    document.addEventListener('mousewheel', onMouseWheel);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyPress);
    document.addEventListener('contextmenu', (event) => event.preventDefault());
    window.addEventListener( 'resize', onWindowResize );

    animate();
    
}


function toTimeString(t) {
    let string = t>0 ? "+" : "-";

    t = Math.abs(t);
    let years = Math.floor(t/365);
    let days = Math.floor(t % 365);

    if (years >= 1000000) {
        let myears=  Math.floor(years/10000)/100;
        string+= `${myears} Myrs`;
    }
    else if (years >= 1000) {
        let kyears=  Math.floor(years/10)/100;
        string+= `${kyears} Kyrs`;
    }
    else if (years >= 10)
        string+= `${years} yrs`;
    else if (years >= 1)
        string+= `${years} yrs ${days} days`;
    else 
        string+= `${days} days`;

    return string;
}

