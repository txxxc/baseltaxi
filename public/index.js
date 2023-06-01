// Initialize and add the map
function live(eventType, elementQuerySelector, cb) {
  document.addEventListener(eventType, function (event) {
    var qs = document.querySelectorAll(elementQuerySelector);
    if (qs) {
      var el = event.target,
        index = -1;
      while (el && ((index = Array.prototype.indexOf.call(qs, el)) === -1)) {
        el = el.parentElement;
      }
      if (index > -1) {
        cb.call(el, event);
      }
    }
  });
}

let map;
let infoWindow;
let marker;
let marker2;
let marker3;
var directionsDisplay;
const image = "/taxi.png";
async function initMap() {

  const position = {
    lat: 38.6434757,
    lng: 0.0082797
  };
  const {
    Map
  } = await google.maps.importLibrary("maps");
  const {
    AdvancedMarkerElement
  } = await google.maps.importLibrary("marker");
  const {
    AutocompleteService
  } = await google.maps.importLibrary("places");
  const directionsService = new google.maps.DirectionsService;

  const beachFlagImg = document.createElement("img");
  beachFlagImg.src =
    "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";

  /* input */
  /*
  {
      "south": 47.45745861776947,
      "west": 7.368691118091064,
      "north": 47.654401834486876,
      "east": 7.918694169848877
    },
    */


  /*
{
    "south": 47.45745861776947,
    "west": 7.368691118091064,
    "north": 47.654401834486876,
    "east": 7.918694169848877
}
  */

  /* --- */
  map = new Map(document.getElementById("map"), {
    zoom: 10,
    //mapTypeId: "hybrid",
    center: position,
    mapId: "DEMO_MAP_ID",
    tilt: 0,
    disableDefaultUI: true,
  });

  marker2 = new google.maps.Marker({
    map: map,
    icon: '/livelocation.gif',
    title: "UserGPSLocation",
  });

  marker3 = new google.maps.Marker({
    map: map,
    icon: '/picked_location.gif',
    title: "UserPickedLocation",
  });

  map.addListener("center_changed", () => {
    console.log(map.getBounds());
  });

  var northEast = new google.maps.LatLng(47.654401834486876, 7.918694169848877)
  var southWest = new google.maps.LatLng(47.45745861776947, 7.368691118091064)


  directionsDisplay = new google.maps.DirectionsRenderer({
    map: map
  });

  const input = document.getElementById("pickupAddress");
  var location = {
    lat: 47.549414,
    lng: 7.588957
  };
  var radius = 1000;
  var circle = new google.maps.Circle({
    center: location,
    radius: radius
  });
  const options = {
    fields: ["formatted_address", "geometry"],
    bounds: circle.getBounds(),
    strictBounds: true,
    //locationRestriction: circle.getBounds(),
    types: ["address"],
  };
  const autocomplete = new google.maps.places.Autocomplete(input, options);
  autocomplete.addListener("place_changed", () => {
    //console.log(`changed`);
    const place = autocomplete.getPlace();
   // console.log(place, place.geometry)
    map.setCenter(place.geometry.location);
    marker3.setPosition(place.geometry.location);
    map.setZoom(16);
    console.log(markers);
    let closestDriver;
    if (markers[`Georgijs`]) {
      closestDriver = markers[`Georgijs`].marker.getPosition();
    } else if (markers[`Grisha`]) {
      closestDriver = markers[`Grisha`].marker.getPosition();
    } else {
      alert(`No Drivers found`);
      return;
    }

    var request = {
      origin: closestDriver,
      destination: place.geometry.location,
      travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        const duration = response.routes[0].legs[0].duration.text;
        const distance = response.routes[0].legs[0].distance.text;
        document.querySelector("#dist").textContent = distance;
        document.querySelector("#tta").textContent = duration;
        directionsDisplay.setDirections(response);
        directionsDisplay.setMap(map);
      } else {
        console.log("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
      }
    });

  });

  infoWindow = new google.maps.InfoWindow();
  // marker = new google.maps.Marker({
  //   map: map,
  //   icon: image,
  //   scaledSize: new google.maps.Size(10, 10),
  //   position: position,
  //   title: "Jorik",
  // });

  getUserLocation();
}
initMap();
fetchTJ();
const locationButton = document.querySelector(`#myLocation`);
const driverLocationButton = document.querySelector(`#driverLocation`);
let livePos = null;

function getUserLocation() {

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        livePos = pos;
        marker2.setPosition(pos);
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
    if (livePos) {
      map.setCenter(livePos);
    }
  } else {
    handleLocationError(false, infoWindow, map.getCenter());
  }
}
locationButton.addEventListener("click", () => {

  getUserLocation();
});

let currentDriverLocation = null;
let currentDrives = [];


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation ?
    "Error: The Geolocation service failed." :
    "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

function placeLocationOnMap() {
  //const location = checkCurrentLocation();
}



let driversOnline = 0;
let markers = {};
live(`click`, `.findDriver`, function (e) {
  const driver = e.target.dataset.driver;
  const position = markers[driver].marker.position;
  console.log(position);
  map.setCenter(position);
});
async function fetchTJ() {
  fetch(`/tj`, {
      method: 'GET',
    })
    .then(res => res.json())
    .catch(function (err) {
      return;
    })
    .then(async function (res) {
      await sleep(1000);
      if (res) {
        //console.log(res);
        if (Object.keys(res).length > 0) {
          driversOnline = Object.keys(res).length;
          document.querySelector("#online span").textContent = driversOnline;
          //console.log(markers);
          // console.log(Object.entries(res));
          for (const [driver, data] of Object.entries(res)) {
            //const marker = createDriverMarker(driver,data);
            //console.log(markers[driver]);
            if (!markers[driver]) {
              const marker = createDriverMarker(driver, data);
              markers[driver] = {
                marker: marker
              };
              const button = document.createElement(`button`);
              button.dataset.driver = driver;
              button.classList.add(`findDriver`);
              button.textContent = `Find ${driver}`;
              document.querySelector("#drivers").appendChild(button)
              //console.log(markers[driver]);
              //console.log(`new driver`);

            } else {
              //console.log(data)
              markers[driver].marker.setPosition({
                lat: data.currentLocation.lat,
                lng: data.currentLocation.lon
              });
              //console.log(markers[driver]);
              //console.log(`exists`);
            }
            //console.log(driver,data);
          }
          // if (res.lon && res.lat) {
          //   var latlng = new google.maps.LatLng(res.lat, res.lon);
          //   currentDriverLocation = latlng;
          //   marker.setPosition(latlng);
          //   //map.setCenter(latlng);
          // }
        }
      }
      //console.log(`...`)
      fetchTJ();
    });
}



function createDriverMarker(driver, data) {
  const position = {
    lat: data.currentLocation.lat,
    lng: data.currentLocation.lon
  };

  return new google.maps.Marker({
    map: map,
    icon: image,
    scaledSize: new google.maps.Size(10, 10),
    position: position,
    title: driver,
  });
}

function sleep(ms) {
  return new Promise(resolveFunc => setTimeout(resolveFunc, ms));
}
async function checkCurrentLocation() {
  return new Promise(resolve => {
    const sir = setInterval(() => {
      console.log(`test`);
      resolve(`test`);
    }, 500);
  })
}