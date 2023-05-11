const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const cors = require('cors');
const app = express();

// define the logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// use the logger to log events
logger.info('Server running on port 3000');

// log an error
try {
  throw new Error('Oops!');
} catch (error) {
  logger.error(error.message); // log the error message
}

app.use(cors());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// define a route to receive data from the Android app
app.post('/', (req, res) => {
  const { watTime, deviceName, latitude, longitude } = req.body;
  // process the data
  console.log(`Received location data: ${watTime}, ${deviceName} (${latitude}, ${longitude})`);
  res.status(200).send('Data received successfully');
});

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
