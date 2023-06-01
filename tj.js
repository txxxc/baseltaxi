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
    fs.readFile('data.json', "utf8", function(err, result) {
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
  driversOnline[data.driver] = {currentLocation: {lat: data.lat, lon: data.lon}};
  
  currentLocation = driversOnline;
  res.status(200).end() // Responding is important
})
app.get('/tj', (request, response) => {
    console.log(currentLocation);
    currentLocation[`Grisha`] = {currentLocation: {
        "lon": 7.572089,
        "lat": 47.559804,
        "driver": "Grisha"
    }};
    console.log(currentLocation);
    response.send(currentLocation);
    // readJSON((err, nameContent) => {
    //     if(err) {
    //         response.status(500).send(err);
    //         return;
    //     }
    //     response.send(nameContent);
    // })

});
app.get('/', (request, response) => {
    response.set('Cache-Control', 'no-store')
    response.sendFile(path.join(__dirname, '/index.html'));
});
app.listen(PORT,function(){
    console.log('Server started at http://localhost:' + PORT);
})
module.exports = app;