import {Vector3D} from './vector.js';

const sinDeg = (x) => Math.sin(x*Math.PI/180);
const cosDeg = (x) => Math.cos(x*Math.PI/180);


const keplerianJPL = (a0, e0, I0, L0, omegaBar0, Omega0, da, de, dI, dL, domegaBar, dOmega) => (t) => {
    //t is in Julian days since J2000
    let centuries = t/36525;

    //semi-major axis in AU
    let a = a0  + da*centuries;
    //eccentricity
    let e = e0 + de*centuries;
    //inclination in degrees
    let I = I0 + dI*centuries;
    //mean longitude in degrees
    let L = L0 + dL*centuries;
    //longitude of perihelion in degrees
    let omegaBar = omegaBar0 + domegaBar*centuries;
    //longitude of ascending node in degrees
    let Omega = Omega0 + dOmega*centuries;

    //argument of perihelion in degrees
    let omega = omegaBar - Omega;
    //mean anomaly in degrees
    let M = L - omegaBar;


    if (Math.abs(e)>1)
        console.log(e);

    //modulus of the mean anomaly to the range [-180, 180]
    M = (M+180)%360 - 180;

    //eccentric anomaly
    const E = solveKeplersEquation(M, e);

    //get coordinates in the orbital frame with x-axis pointing towards the perihelion
    const xprime = a*(cosDeg(E) - e);
    const yprime = a*Math.sqrt(1-e*e)*sinDeg(E);
    const zprime = 0;

    //translate to the ecliptic frame
    const xecl = xprime*(cosDeg(omega)*cosDeg(Omega) - sinDeg(omega)*sinDeg(Omega)*cosDeg(I)) + yprime*(-sinDeg(omega)*cosDeg(Omega) - cosDeg(omega)*sinDeg(Omega)*cosDeg(I));
    const yecl = xprime*(cosDeg(omega)*sinDeg(Omega) + sinDeg(omega)*cosDeg(Omega)*cosDeg(I)) + yprime*(-sinDeg(omega)*sinDeg(Omega) + cosDeg(omega)*cosDeg(Omega)*cosDeg(I));
    const zecl = xprime*sinDeg(omega)*sinDeg(I) + yprime*cosDeg(omega)*sinDeg(I);

    //translate to the J2000 frame
    const epsilon = 23.43929111 - 0.013004167*centuries;
    const x = xecl;
    const y = yecl*cosDeg(epsilon) - zecl*sinDeg(epsilon);
    const z = yecl*sinDeg(epsilon) + zecl*cosDeg(epsilon);


    //convert from AU to km and return
    return new Vector3D(x*1.496e8, y*1.496e8, z*1.496e8);
}

//solve Kepler's equation for E
function solveKeplersEquation(M,e) {
    let E = M - e*sinDeg(M);
    let estar = 180/Math.PI*e;
    let dE = 1;
    let stepCount = 0;
    while (Math.abs(dE) > 1e-6) {
        stepCount++;
        if (stepCount > 10) {
            throw new Error("Exceeed maximum number of steps to solve Keplers Equation with M:"+M+", e:"+e);
        }

        let dM = M - (E - estar*sinDeg(E));
        dE = dM / (1-e*cosDeg(E))
        E = E + dE;
    }
    return E;
}



const mercury = keplerianJPL(0.38709927,0.20563593, 7.00497902,252.2503235, 77.45779628,48.33076593,0.00000037, 0.00001906,-0.00594749, 149472.6741,0.16047689,-0.12534081);
const venus =   keplerianJPL(0.72333566,0.00677672, 3.39467605,181.9790995, 131.6024672,76.67984255,0.0000039, -0.00004107,-0.0007889,  58517.81539,0.00268329,-0.27769418);
const emBarycenter =  keplerianJPL(1.00000261,0.01671123,-0.00001531,100.4645717, 102.9376819,0,          0.00000562,-0.00004392,-0.01294668, 35999.37245,0.32327364,0);
const mars =    keplerianJPL(1.52371034,0.0933941,  1.84969142,-4.55343205,-23.94362959,49.55953891,0.00001847, 0.00007882,-0.00813131, 19140.30268,0.44441088,-0.29257343);
const jupiter = keplerianJPL(5.202887,  0.04838624, 1.30439695,34.39644051, 14.72847983,100.4739091,-0.00011607,-0.00013253,-0.00183714,3034.746128,0.21252668,0.20469106);
const saturn =  keplerianJPL(9.53667594,0.05386179, 2.48599187,49.95424423, 92.59887831,113.6624245,-0.0012506,-0.00050991, 0.00193609, 1222.493622,-0.41897216,-0.28867794);
const uranus =  keplerianJPL(19.18916464,0.04725744,0.77263783,313.2381045, 170.9542763,74.01692503,-0.00196176,-0.00004397,-0.00242939,428.4820279,0.40805281,0.04240589);
const neptune = keplerianJPL(30.06992276,0.00859048,1.77004347,-55.12002969,44.96476227,131.7842257,0.00026291, 0.00005105, 0.00035372, 218.4594533,-0.32241464,-0.00508664);

export {mercury, venus, emBarycenter, mars, jupiter, saturn, uranus, neptune};
