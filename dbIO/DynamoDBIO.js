const AWS = require('aws-sdk');
const fs = require('fs');
const attr = require('dynamodb-data-types').AttributeValue;
const _ = require('lodash');
const dbConf = require("../config/db.js");

// connection for testings
// AWS.config.update({
//   region: "local",
//   endpoint: "http://localhost:8000"
// });


class DynamoDBIO {
    
    constructor(logger) {
        this.logger = logger;
        this.logger.info("DynamoDBIO turn on engines!");
        
        AWS.config.update(dbConf.dynamodb)
        
        // getting the DynamoDB instance
        this.dynamodb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
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
                ReadCapacityUnits: 25, 
                WriteCapacityUnits: 25
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
        
        this.logger.debug('Params for tableExists: ' + JSON.stringify(params));
        
        // creating and returning the Promise 
        return new Promise((resolve, reject) => {
            // making the request to check if the table exists
            this.dynamodb.waitFor('tableExists', params, (err, data) => {
                // some error occurred, may be doesn't exists but also can be another thing
                if (err) {
                    this.logger.debug('Error on tableExists. Error JSON: ' + JSON.stringify(err));
                    // console.log(err, err.stack); // an error occurred
                    // for now, we are going to interpreta that if error then the table doesn't exists
                    resolve(false);
                }
                else {
                    // if no error then the table aready exists
                    // console.log(data);           // successful response
                    resolve(true);
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
        let icount = 0;
        let recursive = false;
        const BreakException = {};
        
        // const mapExceptions = { types: { public: 'B', private: 'B' } };
        
        params.RequestItems[tableName] = [];
        
        // processing the items to insert
        // const putRequests = [];
        
        if(insertItems.length > 25) {
            recursive = true;
        }
        
        try {
            insertItems.forEach(item => {
                let request = {
                    PutRequest: {
                        Item: {}
                    }
                };
                
                request.PutRequest.Item['id'] = { 'S': item.key };
                // delete item.key;
                
                let forBinary = {};
                
                let cleanItem = this.cleanObject(item);
                // this.logger.debug(JSON.stringify(item));
                
                request.PutRequest.Item = { ...request.PutRequest.Item, ...attr.wrap(cleanItem) };
                // this.logger.debug(JSON.stringify(request.PutRequest.Item)); process.exit();
                // adding each insert request object
                params.RequestItems[tableName].push(request);
                icount++;
                
                // removing current item from insertItems
                let index = insertItems.findIndex(element => {
                    return _.isEqual(element, item);
                });
                
                if(index > -1) {
                    insertItems = insertItems.slice(index+1);
                }
                
                if(icount >= 25) {
                //   insertItems = insertItems.slice(24);
                   icount = 0;
                   throw BreakException;
                }
            });
        } catch(e) {
            if (e !== BreakException) throw e;
        }
        
        // this.logger.debug(JSON.stringify(params)); process.exit();
        // console.log(insertItems.length, params.RequestItems[tableName].length); process.exit();
        // this.logger.debug(JSON.stringify(params)); process.exit();
        // this.logger.debug(JSON.stringify(params));
        
        // after generates all the params, then batch to save
        this.dynamodb.batchWriteItem(params, (err, data) => {
            if(err) {
                this.logger.debug("Error inserting data. JSON Error: " + JSON.stringify(err));
                process.exit(1);
            } else {
                if(recursive) {
                    this.logger.info('Batch inserted!');
                    // this.logger.info('New insert:::::::::::::::');
                    // this.logger.debug(JSON.stringify(insertItems));
                    this.batchInsert(tableName, insertItems);
                } else {
                    this.logger.info('Success: ', data);
                    this.logger.info('END the work!');
                    process.exit();
                }
            }
        });
    }
    
    cleanObject(obj) {
        let newObj = {};
        
        Object.keys(obj).forEach(key => {
            if(obj[key] && typeof obj[key] === 'object') {
                this.cleanObject(obj[key]);
            } else if(obj[key] && typeof obj[key] === 'string') {
                if(obj[key].length > 0) {
                    newObj[key] = obj[key];
                }
            } else if(obj[key] && typeof obj[key] !== 'string') {
                newObj[key] = obj[key];
            }
        });
        
        return newObj;
    }
}

module.exports = DynamoDBIO;