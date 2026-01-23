const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 6969;

const server = http.createServer(app);
const io = new Server(server);

let CURRENT_LOCATION = [44.4268, 26.1025];

// === HOME PAGE ===
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/client/pages/index.html")
});

// === PUBLIC STATIC FILES ===
app.use(express.static(__dirname + '/client/pages'));
app.use(express.static(__dirname + '/client/images'));

app.get('/marius.jpg', (req, res) => {
  res.sendFile(__dirname + "/client/images/marius.jpg")
});

// === API ===
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

// === WIKI API WRAPPER ===
app.get('/api/get_wikis', async (req, res) => {
  console.log(`got api request for wiki pages around ${req.query.lat}, ${req.query.lon}`);
  let wiki_params = {
    action: 'query',
    prop: 'coordinates|description|info',
    inprop: 'url',
    generator: 'geosearch',
    ggsradius: req.query.radius, // this value is in meters (between 10 and 10,000)
    ggslimit: req.query.limit,
    ggscoord: req.query.lat + "|" + req.query.lon,
    format: 'json'
  };
  // let wiki_params_text = new URLSearchParams(wiki_params);
  // let wiki_api_url = `https://en.wikipedia.org/w/api.php?${wiki_params_text}`;
  // console.log(wiki_api_url);
  
  let result_data = {};
  let continue_query_params = {};
  try {
    do {
      // add the continue params necessary to the query params
      // if we don't have continue params, nothing will be appended
      wiki_params = {
        ...wiki_params,
        ...continue_query_params
      };
      const wiki_params_url_text = new URLSearchParams(wiki_params);
      const wiki_api_url = `https://en.wikipedia.org/w/api.php?${wiki_params_url_text}`;
      const wiki_response = await fetch(wiki_api_url);
      const data = await wiki_response.json();

      // escape if query result is null
      if (!data.hasOwnProperty('query')) {
        break;
      }

      // append all the new info about the pages from 'data' into 'result_data'
      // go through all the pages gotten from the query
      for (const [pageID, pageData] of Object.entries(data.query.pages)) {
        result_data[pageID] = {
          ...(result_data[pageID] ?? {}), // if we already have the page, add it
          ...pageData // add the new data (it will automatically overwrite any copies)
        };
      }

      if (data.hasOwnProperty('continue')) {
        continue_query_params = data.continue;
        console.log("query is continued!");
      } else {
        continue_query_params = null;
      }

    } while (continue_query_params);

    res.json(result_data);

  } catch (error) {
    res.status(500).json( {
      error: `API fetch failed for ${req.query.lat} and ${req.query.lon}`,
      error_message: `${error}`,
      // wiki_url: wiki_api_url
    } );
  }
});

let index = 0;

// === SOCKET CONNECTIONS FOR LOCATION UPDATE ===
io.on('connection', (socket) => {
  console.log('connection to socket');

  socket.on('get', async (callback) => {
    console.log(`Got GET from socket client`);

    const tempdata = await fetch('http://localhost:6969/api');
    const tempjson = await tempdata.json();
    const temppoint = tempjson.locations[index++ %4].point;

    callback({
      // location: CURRENT_LOCATION
      location: temppoint
    });
    console.log("sent location");
  });

  socket.on('set', (msg) => {
    console.log(`Got SET with ${msg} from socket client`);
    const set_msg = JSON.parse(msg);
    CURRENT_LOCATION = set_msg.location;
  })

  socket.on('disconnect', () => {
    console.log('someone disconnected from socket');
  })
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
