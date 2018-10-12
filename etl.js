const FirebaseIO = require("./helpers/FirebaseIO.js");

class ETL {
    constructor(params) {
        // collection to consult in Firebase
        this.firebaseCollection = params.firebaseCollection;
    }
    
    /**
     * Function to pull data from Firebase and send it to DynamoDB
     */
    pullFromFirebasePushToDynamoDB() {
        // instantiating class that works with firebase
        const fireIO = new FirebaseIO();
        console.log('start to pull!');
        
        console.log('start to push!');
    }
}

module.exports = ETL;