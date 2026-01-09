const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const portName = '/dev/ttyACM0'; 
const baudRate = 9600;

const port = new SerialPort({ path: portName, baudRate: baudRate });

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.on('open', () => {
  console.log(`Serial port ${portName} opened at ${baudRate} baud`);
});

parser.on('data', (data) => {
  data = data.trim();
  if (data.startsWith('{') && data.endsWith('}')) {
    try {
      const gpsData = JSON.parse(data);
      const timestamp = new Date().toISOString();

      console.log(`${timestamp} - GPS Data:`, gpsData);
      
      if (gpsData.sats === 0) {
        console.warn(`${timestamp} - Warning: No satellites detected`);
      }
      if (gpsData.hdop === 0) {
        console.warn(`${timestamp} - Warning: HDOP is 0.00 (no $GPGSA?)`);
      }
    } catch (err) {
      console.error(`Error parsing JSON: ${err.message} - Data: ${data}`);
    }
  } else {
    console.log(`Non-JSON data: ${data}`);
  }
});


port.on('error', (err) => {
  console.error('Serial port error:', err.message);
});

port.on('close', () => {
  console.log('Serial port closed');
  logStream.end();
});
