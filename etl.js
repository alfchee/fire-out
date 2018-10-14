const FirebaseIO = require("./helpers/FirebaseIO.js");

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
        console.log('start to pull!');
        
        // getting data from one collection node using the path 
        const dataFrom = fireIO.fetchData(this.firebaseCollection);
        
        // if we got results, then proess them
        dataFrom.then(results => {
            console.log(results);
        
            console.log('start to push!');
            
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