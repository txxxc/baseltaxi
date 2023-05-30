var express = require('express');
const fs = require('fs');
var cors = require('cors');
var app = express();
const path = require('path');
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config();
var PORT = 8081;
app.use(cors());

app.use(express.static(path.join(__dirname, '/public')))
app.use(bodyParser.json())
function readJSON(callback) {
    fs.readFile('data.json', "utf8", function(err, result) {
        if (err) callback(err);
        callback(null, JSON.parse(result));
    });
}
app.locals.pretty = true;
let currentLocation = {};

app.post("/hook", (req, res) => {
  console.log(req.body) // Call your action on the request here
  currentLocation = req.body;
  res.status(200).end() // Responding is important
})
app.get('/tj', (request, response) => {
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
    res.set('Cache-Control', 'no-store');
    response.sendFile(path.join(__dirname, '/index.html'));
});
app.listen(PORT,function(){
    console.log('Server started at http://localhost:' + PORT);
})
module.exports = app;