const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const cors = require('cors');
const AWS = require('aws-sdk'),
      {
        DynamoDBDocument
      } = require("@aws-sdk/lib-dynamodb"),
      {
        DynamoDB
      } = require("@aws-sdk/client-dynamodb");
const uuid = require('uuid');
require('dotenv').config();
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

app.use(cors());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// configure the AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// create a new instance of the DocumentClient
// const documentClient = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const documentClient = new AWS.DynamoDB.DocumentClient({
  service: new AWS.DynamoDB({ 
    apiVersion: '2012-08-10',
    logger: console // log all DynamoDB operations to console
  })
});

// define a route to receive data from the Android app
app.post('/', (req, res) => {
  const { watTime, deviceName, latitude, longitude } = req.body;
  // process the data
  console.log(`Received location data: ${watTime}, ${deviceName}, ${latitude}, ${longitude}`);

  // create a new item in the DynamoDB table
  const params = {
    TableName: 'location-data',
    Item: {
      id: uuid.v1(),
      watTime,
      deviceName,
      latitude,
      longitude
    }
  };
  documentClient.putItem(params, (err, data) => {
    if (err) {
      console.error(`Unable to add item. Error JSON: ${JSON.stringify(err, null, 2)}`);
      res.status(500).send('Failed to store location data');
    } else {
      console.log(`Location data stored in DynamoDB: ${JSON.stringify(params.Item)}`);
      res.status(200).send('Data received and stored successfully');
    }
  });
});

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
