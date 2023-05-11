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
  accessKeyId: 'us-east-2',
  secretAccessKey: '4e1ugawxiOtGkPPlttIo0qWuLl+cCFCiH/0Agr0g',
  region: 'AKIAXUBC35T6GHASYG24'
});


// Create a new DynamoDB instance
const dynamodb = new AWS.DynamoDB();

// Define the parameters for the scan operation
const params = {
  TableName: 'location-data'
};
// Execute the scan operation
dynamodb.scan(params, (err, data) => {
  if (err) {
    console.error(`Unable to scan table. Error JSON: ${JSON.stringify(err, null, 2)}`);
  } else {
    console.log(`Scan succeeded. Found ${data.Items.length} items.`);
    data.Items.forEach((item) => {
      console.log(JSON.stringify(item));
    });
  }
});



// create a new instance of the DocumentClient
// const documentClient = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const documentClient = DynamoDBDocument.from(new DynamoDB());

// define a route to receive data from the Android app
app.post('/', (req, res) => {
  const { watTime, deviceName, latitude, longitude } = req.body;
  // process the data
  console.log(`Received location data: ${watTime}, ${deviceName}, ${latitude}, ${longitude}`);
  

  // create a new item in the DynamoDB table
  const params = {
    TableName: 'location-data',
    Item: {
    deviceName: {S: 'Samsung S21+'}
  }
  };
  documentClient.put(params, (err, data) => {
    if (err) {
      res.status(500).send('Failed to store location data');
    } else {
      res.status(200).send('Data received and stored successfully');
      console.log(`Location data stored in DynamoDB: ${JSON.stringify(params.Item)}`);
    }
  });
});

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
