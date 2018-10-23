const FirebaseIO = require("./dbIO/FirebaseIO.js");
const DynamoDBIO = require("./dbIO/DynamoDBIO.js");

class ETL {
    constructor(params) {
        // collection to consult in Firebase
        this.firebaseCollection = params.firebaseCollection;
        this.source = params.source;
        this.processIt = params.processIt;
    }
    
    /**
     * Function to pull data from Firebase and send it to DynamoDB
     */
    pullFromFirebasePushToDynamoDB() {
        // instantiating class that works with firebase
        const fireIO = new FirebaseIO();
        const dyDBIO = new DynamoDBIO();
        // max items per batch processing
        // check documentation https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchWriteItem-property
        const maxBatchInput = 25;
        
        console.log('start to pull!');
        
        // getting data from one collection node using the path 
        const dataFrom = fireIO.fetchData(this.firebaseCollection);
        
        let batchInputs = [];
        let counter = 0;
        // if we got results, then proess them
        dataFrom.then(results => {
            console.log('start to push!');
            
            results.forEach((i, record) => {
                // adding the record into the batch
                if(counter < 25) {
                    batchInputs.push(record);
                } else {
                    // make the batch insert
                    dyDBIO.batchInsert(this.firebaseCollection, batchInputs);
                    
                    // clear the variables
                    batchInputs = [];
                    counter = 0;
                }
                // increasing the counter
                counter++;
            });
            
            // if is required to transform the data before to push to Destiny
            if(this.processIt) {
                // TODO: add logic here to process/transform the data before the push
                console.log('process the data before to push!');
            }
            
            console.log('END the work!');
            process.exit();
        });
        
        // if error fetching data from Firebase
        dataFrom.catch(err => {
            console.error(err);
            process.exit(1);
        });
    }
}

module.exports = ETL;