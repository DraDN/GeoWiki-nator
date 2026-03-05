const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { setLocation } = require('./locationState'); // IMPORTĂ SETTER-UL

const RECONNECT_DELAY = 1000;

// let portName = '/dev/ttyACM0'; 
const baudRate = 115200; // MODIFICAT la 115200 conform Arduino
let arduino_connected = false;

function get_arduino_connection() {
  return arduino_connected;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function waitForArduino() {
  console.log('Searching for Arduino... (Plug it in now)');
  
  let arduinoPort = null;

  while (!arduinoPort) {
    const ports = await SerialPort.list();
    
    // Check for official Arduino (2341) or common clones (1a86)
    arduinoPort = ports.find(port => 
      port.vendorId === '2341' || 
      port.vendorId === '1a86' ||
      (port.manufacturer && port.manufacturer.includes('Arduino'))
    );

    if (!arduinoPort) {
      await sleep(1000); 
    }
  }

  console.log(`Found Arduino on ${arduinoPort.path}`);
  return arduinoPort.path;
}

async function startConnection() {
  const portName = await waitForArduino();

  const port = new SerialPort({ path: portName, baudRate: baudRate });

  // MODIFICAT delimitatorul pentru a curăța corect datele
  const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

  port.on('open', () => {
    console.log(`Serial port ${portName} opened at ${baudRate} baud`);
    arduino_connected = true;
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

  port.on('close', () => {
    console.log("Serial port disconnected");
    arduino_connected = false;
    reconnect();
  })

  function reconnect() {
    setTimeout(startConnection, RECONNECT_DELAY);
  }
}

startConnection();

module.exports = {
  get_arduino_connection
}
