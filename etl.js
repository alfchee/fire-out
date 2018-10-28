const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

const FirebaseIO = require("./dbIO/FirebaseIO.js");
const DynamoDBIO = require("./dbIO/DynamoDBIO.js");

class ETL {
    constructor(params) {
        // collection to consult in Firebase
        this.firebaseCollection = params.firebaseCollection;
        this.source = params.source;
        this.processIt = params.processIt;
        
        const logDir = 'log';
        
        // Create the log directory if it does not exist
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir);
        }
        
        const filename = path.join(logDir, 'io-logs.log');
        
        
        this.logger = createLogger({
          level: 'debug',
          format: format.combine(
            format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
          ),
          // You can also comment out the line above and uncomment the line below for JSON format
          // format: format.json(),
          transports: [
              new transports.Console(),
              new transports.File({ filename })
            ]
        });
    }
    
    /**
     * Function to pull data from Firebase and send it to DynamoDB
     */
    pullFromFirebasePushToDynamoDB() {
        // instantiating class that works with firebase
        const fireIO = new FirebaseIO(this.logger);
        const dyDBIO = new DynamoDBIO(this.logger);
        // max items per batch processing
        // check documentation https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchWriteItem-property
        const maxBatchInput = 25;
        // regex to get the table name that will be used in DynamoDB
        const regex = /\//gm;
        const tableName = this.firebaseCollection.replace(regex, '');
        
        this.logger.info('start to pull!!');
        
        // getting data from one collection node using the path 
        const dataFrom = fireIO.fetchData(this.firebaseCollection);
        
        // let batchInputs = [];
        // let counter = 0;
        // if we got results, then proess them
        dataFrom
            .then(results => {
                this.logger.info('Obtained ' + results.length + ' objects to process');
                this.logger.info('start to push!');
                
                // consult if the table does exist befor to try to push data
                dyDBIO.tableExists(tableName)
                    .then(exists => {
                        if(exists) {
                            this.logger.info('Table ' + tableName + ' already exists...');
                            // make the batch insert
                            dyDBIO.batchInsert(tableName, results);
                        } else {
                            this.logger.info('Table ' + tableName + ' doesnt exists... creating table...');
                            // then we should better create the table firstly
                            dyDBIO.createTable(tableName).then(tableData => {
                                if(tableData) {
                                    // then make the batch insert
                                    dyDBIO.batchInsert(tableName, results);
                                }
                            });
                        }
                    })
                    .catch(err => {
                        this.logger.debug('Error checking Table exists. Error JSON: ' + JSON.stringify(err));
                    });
                
                // if is required to transform the data before to push to Destiny
                if(this.processIt) {
                    // TODO: add logic here to process/transform the data before the push
                    this.logger.info('process the data before to push!');
                }
                
                // this.logger.info('END the work!');
                // process.exit();
            })
            .catch(err => {
               this.logger.debug('Error on fetching data from Firebase. Error JSON: ' + JSON.stringify(err)); 
            });
        
        // if error fetching data from Firebase
        dataFrom.catch(err => {
            console.error(err);
            process.exit(1);
        });
    }
}

module.exports = ETL;