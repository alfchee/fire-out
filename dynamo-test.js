const AWS = require('aws-sdk');
const fs = require('fs');
const dbConf = require("./config/db.js");
const https = require('https');

console.log(dbConf.dynamodb);

AWS.config.update(dbConf.dynamodb);

const ddb = new AWS.DynamoDB({
    apiVersion: '2012-10-08',
    // httpOptions: {
    // agent: new https.Agent({
    //   rejectUnauthorized: true,
    //   keepAlive: true
    // })
//   }
});

// AWS.config.update({
//   region: "local",
//   endpoint: "http://localhost:8000"
// });

// const ddb = new AWS.DynamoDB();

const params = {
            TableName: '49ers'
        };
        
console.log(params);

ddb.waitFor('tableExists', params, function(err, data) {
    console.log('Response at > ' + Date());
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

console.log("End the script");
console.log(Date());

