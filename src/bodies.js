import { J2000, Vector3D } from "pious-squid";
import getTenPcStars from "./the10pcsample";

class Body {
    constructor (name, radius, mass, position, velocity, parent=null) {
        this.name = name;
        this.radius = radius;
        this.position = position;
        this.velocity = velocity;
        this.mass = mass;
        this.parent = parent;
    }
}

//parallax is given in milli-arcseconds
function parallaxToDistance(parallax) {
    //distance in parsecs
    let distanceParsec = 1/parallax;
    let distanceKm = 1000*distanceParsec*3.086e13;
    return distanceKm;
}

function igcsToXyz({ra, dec, parallax}) {
    let rho = parallaxToDistance(parallax);
    let x = rho * Math.sin(dec) * Math.cos(ra);
    let y = rho * Math.sin(dec) * Math.sin(ra);
    let z = rho * Math.cos(dec);
    
    return {x,y,z};
}


let sol = new Body("Sun", 696340, 1.989e30,                       new Vector3D(0, 0, 0), new Vector3D(0, 0, 0));

let stars = [sol];

let data = await getTenPcStars();
for (const row of data) {
    const {COMMON_NAME, RA, DEC, PARALLAX} = row;
    const [name,ra,dec,parallax] = [COMMON_NAME, RA, DEC, PARALLAX];

    const {x,y,z} = igcsToXyz({ra,dec,parallax})

    const body = new Body (name, 10000, 0, new Vector3D(x,y,z), new Vector3D(0,0,0));

    if (name && name.startsWith("Prox"))
        console.log({name, x,y,z, dist:parallaxToDistance(parallax)});

    stars.push(body);
}

let planets = [
    new Body("Earth", 12756, 0, new Vector3D(1.496e8, 0, 0), new Vector3D(0, 0, 0), sol),
    new Body("Mars", 6792, 0, new Vector3D(2.2279e8, 0, 0), new Vector3D(0, 0, 0), sol),
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
