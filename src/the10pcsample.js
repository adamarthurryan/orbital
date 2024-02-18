import Papa from 'papaparse';
import {Vector3D} from './vector.js';
import { mars } from './jplKeplerian';

/*
“Galactic (X,Y,Z) coordinates in ly: Similar to Celestial coordinates, but pointing along a set of axes that's not quite so geocentric. The first ("x") coordinate points directly toward the center of our galaxy (which, in the Earth's night sky, is at a right ascension of 17h42m4s and a declination of -28°55'). The second ("y") coordinate points along the galactic plane in the direction of galactic rotation, at right angles to the "x" axis. The third ("z") coordinate points straight out of the plane of the galaxy, parallel to the galactic north pole, at right angles to both the "x" and "y" axes. As with Celestial coordinates, our sun represents the point [0, 0, 0] in this coordinate system.”
*/

function loadData () {
   return  new Promise ((resolve, reject) => {
        Papa.parse("/data/The10pcSample_v2.csv", {
            download: true,
            header: true,
            complete: (results) => resolve(results.data),
            err: (err) => reject(err)
        })
    
    });
}

//calculate position and velocity vectors from ra, dec, parallax, pmra, pmdec, and rv
//per section 1.5.6 of The Hipparcos and Tycho Catalogues, ESA SP-1200 (1997)
// [https://www.cosmos.esa.int/web/hipparcos/catalogues]
function spaceCoordinatesAndVelocity({ra, dec, parallax, pmra, pmdec, rv}) {
    const cos = (deg) => Math.cos(deg*Math.PI/180);
    const sin = (deg) => Math.sin(deg*Math.PI/180);

//    AU/mas * kmperparsec *1000=km/as

    //constants
    const kmPerParsec = 3.086e13;
    const Ap = 1000*kmPerParsec;
    const Av = 4.74074;
    const c = 299792.458;

    const distance = Ap/parallax;
    //doppler factor
    const k = 1/(1-rv/c);

    const u = new Vector3D(cos(dec)*cos(ra), cos(dec)*sin(ra), sin(dec));
    const b = u.scale(distance);
    const p = new Vector3D(-sin(ra), cos(ra), 0);
    const q = new Vector3D(-sin(dec)*cos(ra), -sin(dec)*sin(ra), cos(dec));
    const r = u;
    let v = p.scale(Av/parallax*pmra).add(q.scale(Av/parallax*pmdec)).add(r.scale(rv)).scale(k);

    //v from km/s to km/day
    v=v.scale(60*60*24);

    return {x:b.x, y:b.y, z:b.z, dx:v.x, dy:v.y, dz:v.z};
}



//parallax is given in milli-arcseconds
function parallaxToDistance(parallax) {
    //distance in parsecs
    let distanceParsec = 1/parallax;
    let distanceKm = 1000*distanceParsec*3.086e13;
    return distanceKm;
}

function radecToXyz({ra, dec, parallax}) {
    //this is a naive way of calculating distance
    let rho = parallaxToDistance(parallax);
    return polarToCartesian(ra, dec, rho);
}

function pmradecToDxdydz({pmra, pmdec, rv}) {
    const {x,y,z} = polarToCartesian(pmra, pmdec, rv);
    return {dx:x, dy:z, dz:z};
}

//convert polar to cartesian coordinates
function polarToCartesian(ra, dec, rho) {
    let raRad = ra*Math.PI/180;
    let decRad = dec*Math.PI/180;
    let x = rho * Math.cos(decRad) * Math.cos(raRad);
    let y = rho * Math.cos(decRad) * Math.sin(raRad);
    let z = rho * Math.sin(decRad);
    
    return {x,y,z};
}

//convert all the keys of this object to lowercase
function lowercaseKeys(obj) {
    let objLower = {}
    for (const field of Object.keys(obj)) {
        objLower[field.toLowerCase()]=obj[field];
    }
    return objLower;
}

function categorize({obj_cat}) {

    if (obj_cat == "*" || obj_cat =="LM") 
        return {is_star:true};

    else if (obj_cat == "BD") 
        return {is_brown_dwarf:true};

    else if (obj_cat == "Planet")
        return {is_planet:true};
}

//add some fields to make it easy to work with this data
function conditionData(data) {
    return data.map(row => {
        row =  lowercaseKeys(row)
        Object.assign(row, spaceCoordinatesAndVelocity(row));
        Object.assign(row, categorize(row));
        return row;
    });
}

async function getTenPcGaia() {
    let data = await loadData();
    data = conditionData(data);
    return data;
}



export default getTenPcGaia;
