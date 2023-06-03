import { live, sleep } from "/helpers.js";
let map;
let infoWindow;
let liveLocationMarker;
let pickupMarker;
let directionsDisplay;
let pickupLocation;
let directionsService;
var position = {
  lat: 47.549414,
  lng: 7.588957
};
const config = {
  showCircle: false
}
async function initMap() {
  const {
    Map
  } = await google.maps.importLibrary("maps");
  const {
    AdvancedMarkerElement
  } = await google.maps.importLibrary("marker");
  const {
    AutocompleteService
  } = await google.maps.importLibrary("places");
  directionsService = new google.maps.DirectionsService;
  map = new Map(document.getElementById("map"), {
    zoom: 12,
    center: position,
    tilt: 0,
    disableDefaultUI: true,
  });
  let fillColor, strokeWeight, strokeOpacity, fillOpacity;
  if (config.showCircle) {
    fillColor = '#FF0099';
    strokeWeight = 0;
    strokeOpacity = 0;
    fillOpacity = 0.1;
  } else {
    fillColor = '#FF0099';
    strokeWeight = 0;
    strokeOpacity = 0;
    fillOpacity = 0;
  }
  var radius = 10000;
  var circle = new google.maps.Circle({
    center: position,
    radius: radius,
    strokeOpacity,
    strokeWeight,
    fillColor,
    fillOpacity,
    map: map
  });
  liveLocationMarker = new google.maps.Marker({
    map: map,
    icon: '/livelocation.gif',
    title: "UserGPSLocation",
  });
  pickupMarker = new google.maps.Marker({
    map: map,
    icon: '/picked_location.gif',
    title: "UserPickedLocation",
  });
  // map.addListener("center_changed", () => {
  //   console.log(map.getBounds());
  // });
  directionsDisplay = new google.maps.DirectionsRenderer({
    map: map
  });
  const input = document.getElementById("pickupAddress");
  const options = {
    fields: ["formatted_address", "geometry", "name"],
    bounds: circle.getBounds(),
    strictBounds: true,
  };
  const autocomplete = new google.maps.places.Autocomplete(input, options);
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    map.setCenter(place.geometry.location);
    pickupMarker.setPosition(place.geometry.location);
    map.setZoom(16);
    pickupLocation = place.geometry.location;




  });
  infoWindow = new google.maps.InfoWindow();
  getUserLocation();
}
initMap();
fetchTJ();
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
        liveLocationMarker.setPosition(pos);
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

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation ?
    "Error: The Geolocation service failed." :
    "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}
const locationButton = document.querySelector(`#myLocation`);
locationButton.addEventListener("click", () => {
  getUserLocation();
});
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
        if (Object.keys(res).length > 0) {
          driversOnline = Object.keys(res).length;
          document.querySelector("#online span").textContent = driversOnline;
          for (const [driver, data] of Object.entries(res)) {
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
            } else {
              markers[driver].marker.setPosition({
                lat: data.currentLocation.lat,
                lng: data.currentLocation.lon
              });
            }
          }
        }
      }
      fetchTJ();
    });
}
const image = "/taxi.png";

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
alertRideRequest();
let rideNR = 1;
live(`click`, `#requestPickup`, function (e) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var raw = JSON.stringify({
    "id": rideNR,
    "user_id": 456,
    "location": pickupLocation,
    "accepted": false
  });
  rideNR++;
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  fetch("/rides", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error))
});

live(`click`, `.accept_ride`, function (e) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var raw = JSON.stringify({
    "ride_id": parseInt(e.target.dataset.rideid),
    "driver_id": 111
  });
  var requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  fetch("/rides", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

  showDirectionsToClient();
});

function showDirectionsToClient() {
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
    destination: pickupLocation,
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
}

function alertRideRequest() {
  fetch(`/rides`, {
      method: 'GET',
    })
    .then(res => res.json())
    .catch(function (err) {
      console.log(err);
      return;
    })
    .then(async function (res) {
      await sleep(500);
      console.log(res);
      createRideRequests(res);
      if (res.length > 0) {
        document.querySelector(`#rideRequests`).classList.remove(`hidden`);
      } else {
        document.querySelector(`#rideRequests`).classList.add(`hidden`);
      }
      alertRideRequest();
    });
};

function createRideRequests(x) {
  let ridesHTML = '';
  for (const rideRequest of x) {
    const div = `
      <div class="rideRequest">
        <p>Ride ID: <span>${rideRequest.id}</span></p>
        <p>Rider ID: <span>${rideRequest.user_id}</span></p>
        <p>Distance: <span>4.5km</span></p>
        <p>Time to arrive: <span>5 min</span></p>
        <p>Location: <span><a href="#">Show Directions</a></span></p>
        <button class="accept_ride" data-rideid="${rideRequest.id}">Accept</button>
      </div>
    `;
    ridesHTML += div;
  };
  document.querySelector(`#rideRequests`).innerHTML = ridesHTML;
};