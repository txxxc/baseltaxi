// Initialize and add the map
let map;
let marker;
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

  const image =
    "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";
  map = new Map(document.getElementById("map"), {
    zoom: 16,
    center: position,
    mapId: "DEMO_MAP_ID",
  });
  marker = new google.maps.Marker({
    map: map,
    content: beachFlagImg,
    position: position,
    title: "Jorik",
  });
}
initMap();

fetchTJ();

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
        if (Object.keys(res).length > 0) {
          console.log(res);
          const pos = res.current.geometry.coordinates;

          console.log(pos);
          var latlng = new google.maps.LatLng(pos[1], pos[0]);
          marker.setPosition(latlng);
          map.setCenter(latlng);
        }
      }
      console.log(`...`)
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