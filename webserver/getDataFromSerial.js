const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { setLocation } = require('./locationState'); // IMPORTĂ SETTER-UL

const portName = '/dev/ttyACM0'; 
const baudRate = 115200; // MODIFICAT la 115200 conform Arduino

const port = new SerialPort({ path: portName, baudRate: baudRate });

// MODIFICAT delimitatorul pentru a curăța corect datele
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

port.on('open', () => {
  console.log(`Serial port ${portName} opened at ${baudRate} baud`);
});

parser.on('data', (data) => {
  data = data.trim();
  if (data.startsWith('{') && data.endsWith('}')) {
    try {
      const gpsData = JSON.parse(data);
      if (gpsData.type === 'location') {
        // ACTUALIZĂM LOCAȚIA CENTRALIZATĂ
        setLocation(gpsData.lat, gpsData.lng);
        console.log(`GPS Update: ${gpsData.lat}, ${gpsData.lng}`);
      }
    } catch (err) {
      console.error(`Error parsing JSON: ${err.message}`);
    }
  }
});

port.on('error', (err) => {
  console.error('Serial port error:', err.message);
});
