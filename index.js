var satellite = require('satellite.js');

var tleLine1 = '1 47960U 21022AE  22356.58134354  .00007766  00000-0  48335-3 0  9996',
    tleLine2 = '2 47960  97.5165 252.4706 0018432 218.7877 258.1903 15.09735095 95876';

var satrec = satellite.twoline2satrec(tleLine1, tleLine2);

var observerLon = 37.14245;
var ovserverLat = 55.57615;

var motorStep = 0.06;

var observerGd = {
    longitude: satellite.degreesToRadians(observerLon),
    latitude: satellite.degreesToRadians(ovserverLat),
    height: 0.0
};

var difference = function(a, b) {
    if (a > b) {
        return a - b;
    } else if (b < a) {
        return b - a;
    }
    return 0;
}

var lastAzimuthDeg = 0;
var lastElevationDeg = 0;

while (true) {
    var positionAndVelocity = satellite.propagate(satrec, new Date);
    var positionEci = positionAndVelocity.position,
        velocityEci = positionAndVelocity.velocity;
    var gmst = satellite.gstime(new Date);

    var positionEcf   = satellite.eciToEcf(positionEci, gmst),
        observerEcf   = satellite.geodeticToEcf(observerGd),
        positionGd    = satellite.eciToGeodetic(positionEci, gmst),
        lookAngles    = satellite.ecfToLookAngles(observerGd, positionEcf);

// Look Angles may be accessed by `azimuth`, `elevation`, `range_sat` properties.
    var azimuth   = lookAngles.azimuth,
        elevation = lookAngles.elevation,
        rangeSat  = lookAngles.rangeSat;

    var longitudeDeg = satellite.degreesLong(positionGd.longitude),
        latitudeDeg  = satellite.degreesLat(positionGd.latitude);

    var observeAzimuthDeg = azimuth * (180/Math.PI);
    var observeElevationDeg = elevation * (180/Math.PI);

    if (difference(lastAzimuthDeg, observeAzimuthDeg) > motorStep || difference(lastElevationDeg, observeElevationDeg) > motorStep) {
        console.log("SAT: ORBICRAFT-ZORKY");
        console.log(new Date);
        console.log("Observer: ", ovserverLat, observerLon);
        console.log("SAT long: ", longitudeDeg);
        console.log("SAT lat", latitudeDeg);
        console.log("Observe azimuth: ", observeAzimuthDeg);
        console.log("Observe elevation: ", observeElevationDeg);
        console.log("Distance to SAT: ", rangeSat);
        lastAzimuthDeg = observeAzimuthDeg;
        lastElevationDeg = observeElevationDeg;
    }
}

