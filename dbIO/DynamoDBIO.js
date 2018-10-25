const AWS = require('aws-sdk');
const fs = require('fs');

// connection for testings
AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});


class DynamoDBIO {
    
    constructor(logger) {
        this.logger = logger;
        this.logger.info("DynamoDBIO turn on engines!");
        
        // getting the DynamoDB instance
        this.dynamodb = new AWS.DynamoDB();
    }
    
    /**
     * createTable  creates a table by a given table name and return a promise with the result
     * @params  tableName   Name of the table that will be created
     * @return  Promise     Promise that contains the response obtained from the intent of table creation
     */
    createTable(tableName) {
        // creating the params to create the table
        const params = {
            TableName: tableName,
            KeySchema: [
                { AttributeName: 'tableName' , KeyType: 'HASH' }
            ],
            AttributeDefinitions: [
                { AttributeName: 'tableName', AttributeType: 'S' }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5, 
                WriteCapacityUnits: 5
            }
        };
        
        // create an return the Promise
        return new Promise((resolve, reject) => {
            // creating the request to create the Table
            this.dynamodb.createTable(params, (err, data) => {
                if(err) {
                    // in case of error, logs it and reject the Promise
                    this.logger.debug('Unable to create table. Error JSON: ' + JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    // if the dable was created successfuly then resolve the promise
                    this.logger.info('Created table. Table decription JSON: ' + JSON.stringify(data, null, 2));
                    resolve(data);
                }
            })
        });
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
                    this.logger.debug('Unable to create table. Error JSON: ' + JSON.stringify(err, null, 2));
                } else {
                    this.logger.info("Created table. Table description JSON:" + JSON.stringify(data, null, 2));
                }
            });
        });
    }
    
    /**
     * tableExists  is a method that takes a table name and request for describeTable(), if result then the table exists
     * @params  tableName   Name of the table to consult if exists
     * @return  Promise<boolean>    A promise that returns a boolean, true or false
     */
    tableExists(tableName) {
        // creating the params to be sent in the request
        const params = {
            TableName: tableName
        };
        
        // creating and returning the Promise 
        return new Promise((resolve, reject) => {
            // making the request of the description
            this.dynamodb.describeTable(params, (err, data) => {
                if(err) {
                    // some error occurred, may be doesn't exists but also can be another thing
                    this.logger.debug('Error on describeTable, Error: ' + JSON.stringify(err));
                    // for now, we are going to interpreta that if error then the table doesn't exists
                    resolve(false);
                } else {
                    // if no error then the table aready exists
                    resolve(true);
                }
            })
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
                this.logger.debug("Error inserting data. JSON Error: " + JSON.stringify(err));
            } else {
                this.logger.info('Success: ', data);
            }
        });
    }
}

module.exports = DynamoDBIO;