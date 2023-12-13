
// connection with socket at port 8080 from 3000

const socket = io();

// used to do something if connection is established

socket.on("connect", () => {
    console.log("connected to socket from client");
})

let map, osm, count = 0, busIcon,driver =0,lat,lang; // Declare map in the global scope

busIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/3448/3448339.png', // Example icon URL
    iconSize: [50,50], // Set the size of the icon
});

navigator.geolocation.getCurrentPosition(gotlocation, errorlocation, { enableHighAccuracy: true });

function gotlocation(position) {
    
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    lat = latitude;
    lang = longitude;


    let allCookies = document.cookie; // Get all cookies as a string
    let cookiesArray = allCookies.split("; "); // Split cookies into an array

    for (let i = 0; i < cookiesArray.length; i++) {
        let cookie = cookiesArray[i];
        if (cookie.indexOf("driver") === 0) {
            driver=1;
        }
    }

    // shahring location
    if (driver) {
        socket.emit("sendlocation", { latitude: latitude, longitude: longitude, accuracy: accuracy }, () => {
            console.log('location send and the response from server is');
        })
    }else {
        console.log("no driver");
    }

    console.log(position);
    if (count == 0) {
        setmap(latitude, longitude, accuracy);
        count = 1;
    }
    else {
        setposition(latitude, longitude, accuracy);
    }
}

function errorlocation(error) {
    console.error('Error:', error);
    setmap(29.34444444, 79.56305556)
}

// setting map 

function setmap(latitude, longitude, accuracy) {
    // Generating map using our position

    map = L.map('map', {
        center: [0, 0],
        zoom: 11
    });

    // OpenStreetMap (OSM) layer
    osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Adding OSM layer to the map
    osm.addTo(map);

    // add search bar
    var geocoder= L.Control.Geocoder.nominatim();
     console.log("hlw",geocoder);
    var geolocation = L.Control.geocoder({
        defaultMarkGeocode: false,
        position: 'topleft',  // Set the position to topright
        geocoder: geocoder
      })
        .on('markgeocode', function(e) {
          var bbox = e.geocode.bbox;
          var poly = L.polygon([
            bbox.getSouthEast(),
            bbox.getNorthEast(),
            bbox.getNorthWest(),
            bbox.getSouthWest()
          ]).addTo(map);
          map.fitBounds(poly.getBounds());
        })
        .addTo(map);

    // adding routing mechanism

    var control = L.Routing.control({
        waypoints: [
            L.latLng(latitude, longitude) // Default starting point
        ],
        routeWhileDragging: true,
        geocoder: L.Control.Geocoder.nominatim(),
        createMarker: function(i, waypoint, n) {
            // Create a marker only for the last (destination) waypoint
            if (i === n - 1) {
                return L.marker(waypoint.latLng);
            }
            return null; // Return null for other waypoints
        }
    });

    control.addTo(map);

    // handling geostationary result

    map.on('geocoder:result', function (e) {
        var waypoint = L.latLng(e.result.center.lat, e.result.center.lng);
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, waypoint);
    });

    const userLatLng = L.latLng(latitude, longitude);

    // Create a bounding box centered around the user's location
    const bounds = userLatLng.toBounds(5000); // 500 meters in all directions

    // Fit the map to the bounding box
    map.fitBounds(bounds);

    if (navigator.geolocation) setposition(latitude, longitude, accuracy);
}

if (navigator.geolocation) {
    const mapLoaderid = setInterval(() => {
        navigator.geolocation.getCurrentPosition(gotlocation, errorlocation, { enableHighAccuracy: true });
    }, 10000);
}


// desginning marker on the map

let marker, circle;

function setposition(latitude, longitude, accuracy) {

    if (marker) map.removeLayer(marker);
    if (circle) map.removeLayer(circle);

    if (driver == 0) {
        marker = L.marker([latitude, longitude]).addTo(map);
    }
    else {
        marker = L.marker([latitude, longitude], { icon: busIcon }).addTo(map);
    }
    circle = L.circle([latitude, longitude], { radius: accuracy }).addTo(map);

    // const userLatLng = L.latLng(latitude, longitude);


    // Create a bounding box centered around the user's location
    // const bounds = userLatLng.toBounds(5000); // 500 meters in all directions

    // Fit the map to the bounding box
    // map.fitBounds(bounds);
}

let markerbus, circlebus;

function setbusposition(latitude, longitude, accuracy) {

    if (markerbus) map.removeLayer(markerbus);
    if (circlebus) map.removeLayer(circlebus);

    // let markerBusIcon = L.icon({
    //     iconUrl: 'https://cdn-icons-png.flaticon.com/128/3448/3448339.phttps://www.flaticon.com/free-icon/location_10903014ng', // Example icon URL
    //     iconSize: [50, 50], // Set the size of the icon
    //     iconAnchor: [16, 32], // Set the anchor point of the icon
    // });

    markerbus = L.marker([latitude, longitude], { icon: busIcon }).addTo(map);

    circlebus = L.circle([latitude, longitude], { radius: accuracy }).addTo(map);

    const userLatLng = L.latLng(latitude, longitude);

    // Create a bounding box centered around the user's location
    userLatLng.toBounds(5000); // 500 meters in all directions
}

// on clicking circular button

// function onCircularButtonClick() {
//     // Change the background color of the button
//     var button = document.querySelector('.circular-button');
//     button.style.backgroundColor = '#f00'; // Change to your desired color

//     const userLatLng = L.latLng(lat,lang);

//     // Create a bounding box centered around the user's location
//     const bounds = userLatLng.toBounds(5000); // 500 meters in all directions

//     // Fit the map to the bounding box
//     map.fitBounds(bounds);

// }

// print all the location acheived from server
socket.on("printlocation", (data) => {
    console.log('this data is from server');
    console.log(data.latitude);
    if (data.latitude !== undefined && data.longitude !== undefined && data.accuracy !== undefined) {
        console.log('calling function and locating others');
        setbusposition(data.latitude, data.longitude, data.accuracy);
    } else {
        console.log('Incomplete data received from server');
    }
})