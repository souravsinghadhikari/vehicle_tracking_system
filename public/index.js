// const bodyParser = require("body-parser");
// connection with socket at port 8080 from 3000
const socket = io('http://localhost:8080'); // Connect to the server

socket.on("connect",()=>{
    console.log(socket.id);
})
 
// map bnra

let map,osm,count=0; // Declare map in the global scope

navigator.geolocation.getCurrentPosition(gotlocation, errorlocation, { enableHighAccuracy: true });

function gotlocation(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy=position.coords.accuracy;

    // shahring location

    socket.emit("sendlocation",{latitude : latitude, longitude : longitude, accuracy : accuracy},(response)=>{
        console.log('location send');
    })


    console.log(position);
    if (count==0){
        setmap(latitude,longitude,accuracy);
        count=1;
    }
    else {
        setposition(latitude,longitude,accuracy);
    }
}

function errorlocation(error) {
    console.error('Error:', error);
    setmap(29.34444444,79.56305556)
}

// desigining whole map

function setmap(latitude,longitude,accuracy){
    // Generating map using our position
    
    map = L.map('map', {
        center: [latitude, longitude],
        zoom: 11
    });

    // OpenStreetMap (OSM) layer
    osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Adding OSM layer to the map
    osm.addTo(map);
    
    if(navigator.geolocation) setposition(latitude,longitude,accuracy);
}

if(navigator.geolocation){   
const mapLoaderid = setInterval(() => {
    navigator.geolocation.getCurrentPosition(gotlocation,errorlocation,{enableHighAccuracy:true});
}, 10000);
}


// desginning marker on the map

let marker , circle;
 
function setposition(latitude,longitude,accuracy){
    
    if(marker)map.removeLayer(marker);
    if(circle)map.removeLayer(circle);
    
    marker = L.marker([latitude,longitude]).addTo(map);
    circle = L.circle([latitude,longitude],{radius:accuracy}).addTo(map);
   
    const userLatLng = L.latLng(latitude, longitude);


    // Create a bounding box centered around the user's location
    const bounds = userLatLng.toBounds(5000); // 500 meters in all directions

    // Fit the map to the bounding box
    map.fitBounds(bounds);
}


// print all the location acheived from server
socket.on("printlocation",(data,callback)=>{
    console.log('this data is from server');
        console.log('calling function and locating others');
        setposition(data.latitude,data.longitude,data.accuracy);
    callback("data is printed");
})
