import { J2000, Vector3D } from "pious-squid";
import getTenPcStars from "./the10pcsample";
import * as Planets from './jplKeplerian.js'

class Body {
    //position is a function from time to Vector3D
    constructor (name, radius, mass, position) {
        this.position = position;
        this.name = name;
        this.radius = radius;
        this.mass = mass;
    }
}

// a fixed position
const fixed = (position) => (t) => position;
// a constant velocity
const constant = (p0, v) => (t) => p0.add(v.scale(t));
// a position relative to another body
const relative = (parent, position) => (t) => parent.position(t).add(position(t));
// a keplerian orbit around the origin





let sol = new Body("Sun", 696340, 1.989e30,  fixed(new Vector3D(0,0,0)));

let stars = [sol];

let data = await getTenPcStars();
for (const row of data) {
    const name = row.common_name;
    const body = new Body (name, 10000, 0, fixed(new Vector3D(row.x,row.y,row.z)));

    if (name && name.startsWith("Prox"))
        console.log(row);

    stars.push(body);
}

let planets = [
    new Body("Mercury", 2439, 0, Planets.mercury),
    new Body("Venus", 6052, 0, Planets.venus),
    //new Body("Earth", 6371, 0, Planets.earth),
    new Body("Mars", 3390, 0, Planets.mars),
    new Body("Jupiter", 69911, 0, Planets.jupiter),
    new Body("Saturn", 58232, 0, Planets.saturn),
    new Body("Uranus", 25362, 0, Planets.uranus),
    new Body("Neptune", 24622, 0, Planets.neptune),
]

let bodies = stars.concat(planets);

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
