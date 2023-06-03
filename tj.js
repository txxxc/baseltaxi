var express = require('express');
const fs = require('fs');
var cors = require('cors');
var lessMiddleware = require('less-middleware');
var app = express();
const path = require('path');
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config();
var PORT = 8081;



app.use(lessMiddleware(__dirname + '/public'));
app.use(cors());
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());

function readJSON(callback) {
  fs.readFile('requests.json', "utf8", function (err, result) {
    if (err) callback(err);
    callback(null, JSON.parse(result));
  });
}
app.locals.pretty = true;
console.log(`Your port is ${process.env.GOOGLEKEY}`);
let currentLocation = {};
const driversOnline = {};
app.post("/hook", (req, res) => {
  const data = req.body;
  if (!data) {
    console.error(`No payload received`);
    res.status(401).end()
    return;
  }
  if (!data.driver) {
    console.error(`No driver.`);
    res.status(401).end()
    return;
  }
  if (!data.lat) {
    console.error(`No LAT.`);
    res.status(401).end()
    return;
  }
  if (!data.lon) {
    console.error(`No LON.`);
    res.status(401).end()
    return;
  }
  driversOnline[data.driver] = {
    currentLocation: {
      lat: data.lat,
      lon: data.lon
    }
  };
  currentLocation = driversOnline;
  res.status(200).end() // Responding is important
})
app.get('/tj', (request, response) => {
  currentLocation[`Grisha`] = {
    currentLocation: {
      "lon": 7.572089,
      "lat": 47.559804,
      "driver": "Grisha"
    }
  };
  response.send(currentLocation);
});
let rides = [];
const fakeRide = {
  "id": 1,
  "user_id": 123,
  "location": {
    "lat": 47.449414,
    "lng": 7.388957
  },
  "accepted": false
};

//rides.push(fakeRide);
const fakeRide2 = {
  "id": 2,
  "user_id": 123,
  "location": {
    "lat": 47.449414,
    "lng": 7.388957
  },
  "accepted": false
};
//rides.push(fakeRide2);

function rideExists(id) {
  let obj = rides.find(o => o.id === id);
  return obj;
}


app.post("/rides", (req, res) => {
  const data = req.body;
  rides.push(req.body);
  console.log(rides);
  res.status(200).end();
})
app.get('/rides', (request, response) => {
  response.set('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json');
  response.send(rides);
});
app.put("/rides", (req, res) => {
  const data = req.body;
  console.log(data);
  const ride_id = data.ride_id;
  const exists = rideExists(ride_id);
  if(exists) {
    rides = rides.filter(function(obj) {
      return obj.id !== exists.id;
    });
  }
  console.log(rides);
  res.status(200).end();
})
app.get('/', (request, response) => {
  response.set('Cache-Control', 'no-store')
  response.sendFile(path.join(__dirname, '/index.html'));
});
app.listen(PORT, function () {
  console.log('Server started at http://localhost:' + PORT);
})
module.exports = app;