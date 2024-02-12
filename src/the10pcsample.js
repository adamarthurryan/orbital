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

//add some fields to make it easy to work with this data
function conditionData(data) {
    return data;
}

async function getTenPcStars() {
    let data = await loadData();
    data = conditionData(data);
    return data;
}



export default getTenPcStars;
