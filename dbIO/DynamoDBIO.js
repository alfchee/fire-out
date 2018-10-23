const AWS = require('aws-sdk');
const fs = require('fs');

// connection for testings
AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});


class DynamoDBIO {
    
    constructor() {
        console.log("DynamoDBIO turn on engines!");
        
        // getting the DynamoDB instance
        this.dynamodb = new AWS.DynamoDB();
    }
    
    /**
     * createAllTables  is a method that takes a schema defined in a JSON file and tries to create the tables defined
     */
    createAllTables() {
        // reading the definition of the tables
        const allTables = JSON.parse(fs.readFileSync('../config/tables-schema.json', 'UTF-8'));
        
        // looping to create tables
        allTables.forEach(tableParams => {
            this.dynamodb.createTable(tableParams, (err, data) => {
                if(err) {
                    console.log('Unable to create table. Error JSON: ', JSON.stringify(err, null, 2));
                } else {
                    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
                }
            });
        });
    }
    
    /**
     * batchInsrt   is a method that takes a table name and an array of items and try to insert it as batch
     * @params  tableName   Name of the table in which the data will be inserted
     * @params  insertItems Array of items to be inserted
     */
    batchInsert(tableName, insertItems) {
        // creating the params object
        let params = {
            RequestItems: {}
        };
        params.RequestItems[tableName] = [];
        
        // processing the items to insert
        const putRequests = [];
        
        insertItems.forEach(item => {
           let request = {
                PutRequest: {
                    Item: {}
                }
           };
           
           // adding each insert request object
           params.RequestItems[tableName].push(request);
        });
        
        // after generates all the params, then batch to save
        this.dynamodb.batchWriteItem(params, (err, data) => {
            if(err) {
                console.log("Error inserting data. JSON Error: ", JSON.stringify(err));
            } else {
                console.log('Success: ', data);
            }
        });
    }
}

module.exports = DynamoDBIO;