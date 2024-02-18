import { Vector3D } from "./vector.js";
import getTenPcGaia from "./the10pcsample";
import * as Planets from './jplKeplerian.js';
import * as THREE from 'three';

class Body {
    //position is a function from time to Vector3D
    constructor ({name, position}) {
        this.position = position;
        this.name = name;
    }
}

class Sphere extends Body {
    constructor ({name, radius, mass, color="#ffffff", position}) {
        super({name, position});

        this.radius=radius;
        this.mass=mass;
        this.color=color;

        this.alwaysVisible = true;
        this.mesh=this._createSphere();
    }

    _createSphere() {
        let {x,y,z} = this.position(0);
        const geo = new THREE.SphereGeometry(this.radius, 16, 16);
        const mat = new THREE.MeshBasicMaterial( { color: this.color } );
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        return mesh;
    }
}

// a fixed position
const fixed = (position) => (t) => position;
// a constant velocity
const constant = (p0, v) => (t) => p0.add(v.scale(t));
// a position relative to another body
const relative = (parent, position) => (t) => parent.position(t).add(position(t));
// a keplerian orbit around the origin





let sol = new Sphere({name: "Sun", radius:696340, mass:1.989e30, color:"#ffffff", position:fixed(new Vector3D(0,0,0))});

let stars = [sol];

let data = await getTenPcGaia();
data = data.filter(row => row.is_star);
console.log(data);

for (const row of data) {
    const name = row.common_name;
    const body = new Sphere ({name, radius:100000, mass:0, color:"#ffffff", position:constant(new Vector3D(row.x,row.y,row.z), new Vector3D(row.dx, row.dy, row.dz))});

    if (name && name.startsWith("Prox"))
        console.log(row);

    stars.push(body);
}

let planets = [
    new Sphere({name:"Mercury", radius:2439, mass:0, color:"#cccccc",position:Planets.mercury}),
    new Sphere({name:"Venus", radius:6052, mass:0, color:"#7fffff",position:Planets.venus}),
    new Sphere({name:"Earth", radius:6371, mass:0, color:"#7f7fff",position:Planets.emBarycenter}),
    new Sphere({name:"Mars", radius:3390, mass:0, color:"#ff7f7f",position:Planets.mars}),
    new Sphere({name:"Jupiter", radius:69911, mass:0, color:"#ff7f7f",position:Planets.jupiter}),
    new Sphere({name:"Saturn", radius:58232, mass:0, color:"#7fffff",position:Planets.saturn}),
    new Sphere({name:"Uranus", radius:25362, mass:0, color:"#ff7fff",position:Planets.uranus}),
    new Sphere({name:"Neptune", radius:24622, mass:0, color:"#ff7fff",position:Planets.neptune}),
]

let bodies = [];
bodies = bodies.concat(stars);
bodies = bodies.concat(planets);

export default bodies;
/*
class Planet extends Body {
    constructor() {
        super();
    }
}

class Star extends Body {
    constructor() { 
        super();
    }
}

class GalacticCenter extends Body {
    constructor() {
        super();
    }
}
*/
