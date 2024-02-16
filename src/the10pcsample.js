import Papa from 'papaparse';

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
    let x = rho * Math.sin(decRad) * Math.cos(raRad);
    let y = rho * Math.sin(decRad) * Math.sin(raRad);
    let z = rho * Math.cos(decRad);
    
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

//add some fields to make it easy to work with this data
function conditionData(data) {
    return data.map(row => {
        row =  lowercaseKeys(row)
        Object.assign(row, radecToXyz(row));
        Object.assign(row, pmradecToDxdydz(row));
        return row;
    });
}

async function getTenPcStars() {
    let data = await loadData();
    data = conditionData(data);
    return data;
}



export default getTenPcStars;
