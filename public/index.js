// Initialize and add the map
let map;
let infoWindow;
let marker;
let marker2;
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
  const beachFlagImg = document.createElement("img");
  beachFlagImg.src =
    "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";

  const image = "/taxi.png";
  map = new Map(document.getElementById("map"), {
    zoom: 15,
    //mapTypeId: "hybrid",
    center: position,
    mapId: "DEMO_MAP_ID",
    tilt: 0,
    disableDefaultUI: true,
  });
  infoWindow = new google.maps.InfoWindow();
  marker = new google.maps.Marker({
    map: map,
    icon: image,
    scaledSize: new google.maps.Size(10, 10),
    position: position,
    title: "Jorik",
  });
  marker2 = new google.maps.Marker({
    map: map,
    title: "User",
  });
}
initMap();
fetchTJ();
const locationButton = document.querySelector(`#myLocation`);
const driverLocationButton = document.querySelector(`#driverLocation`);
locationButton.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        marker2.setPosition(pos);
        map.setCenter(pos);
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    handleLocationError(false, infoWindow, map.getCenter());
  }
});

let currentDriverLocation = null;

driverLocationButton.addEventListener("click", () => {
  if (currentDriverLocation != null) {

    map.setCenter(currentDriverLocation);
  }
});


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

function placeLocationOnMap() {
  //const location = checkCurrentLocation();
}
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
          if (res.lon && res.lat) {
            var latlng = new google.maps.LatLng(res.lat, res.lon);
            currentDriverLocation = latlng;
            marker.setPosition(latlng);
            //map.setCenter(latlng);
          }
        }
      }
      //console.log(`...`)
      fetchTJ();
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