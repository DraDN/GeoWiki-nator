const express = require('express');
const http = require('http');

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');


const app = express();
const PORT = 6969;

const port = new SerialPort({ path: '/dev/ttyACM0', baudRate: 115200 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

let lastLoc = { lat: 44.4268, lon: 26.1025 }; // Locație default

parser.on('data', (data) => {
  try {
    const json = JSON.parse(data);
    if (json.type === 'location') {
      lastLoc.lat = json.lat;
      lastLoc.lon = json.lng;
    }
  } catch (e) { /* Ignoră datele care nu sunt JSON */ }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/client/pages/index.html")
});

app.get('/marius.jpg', (req, res) => {
  res.sendFile(__dirname + "/client/images/marius.jpg")
});

app.get('/api', (req, res) => {
  res.json(
    {
        "message": "megalocatii",
        "locations": [
          {
          "name": "uwu1",
          "point": [44.4268, 26.1025]
          },
          {
          "name": "uwu2",
          "point": [44.4268, 26.1525]
          },
          {
          "name": "uwu3",
          "point": [44.4768, 26.1525]
          },     
          {
          "name": "uwu4",
          "point": [44.4768, 26.1025]
          },      
        ]
    });
});

app.get('/api/get_wikis', async (req, res) => {
  const lat = req.query.lat || lastLoc.lat;
  const lon = req.query.lon || lastLoc.lon;

  const wiki_params = new URLSearchParams(
    action: 'query',
    prop: 'coordinates|description|info',
    inprop: 'url',
    generator: 'geosearch',
    ggsradius: req.query.radius, // this value is in meters (between 10 and 10,000)
    ggslimit: req.query.limit,
    ggscoord: req.query.lat + "|" + req.query.lon,
    format: 'json'
  });
  const wiki_api_url = `https://en.wikipedia.org/w/api.php?${wiki_params}`;
  console.log("Requesting Wiki for:", lat, lon);
  
  try {
    // fetch(wiki_api_url).then(response => response.json()).then(data => res.json=data);
    const wiki_response = await fetch(wiki_api_url);
    const data = await wiki_response.json();
    res.json(data);
    // res.json( {
      // "test": "test"
    // });
  } catch (error) {
    res.status(500).json( {
      error: `API fetch failed for ${req.query.lat} and ${req.query.lon}`,
      wiki_url: wiki_api_url
    } );
  }
})

app.get('/api2', (req, res) => {
  res.json(
    {
      "name": "Andy",
      "age": "100",
      "hobbies": [
        "having fun",
        "anime",
        "idk bro"
      ]
    }
  );
});


const server = http.createServer(app);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
