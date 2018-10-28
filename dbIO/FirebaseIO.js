const firebase = require('firebase-admin');
// importing the database connection parameters
const dbConf = require("../config/db.js");

class FirebaseIO {
    
    constructor(logger) {
        this.logger = logger;
        this.logger.info('FirebaseIO turn on engines!!');
        
        // initializing the connection with firebase database
        firebase.initializeApp({
            credential: firebase.credential.cert(dbConf.firebase.cert),
            databaseURL: dbConf.firebase.databaseURL
        });
        
        // creating a short access to database from inside the class
        this.database = firebase.database();
    }
    
    /**
     * fetchData    Reads data from path structure of Firebase
     * @params  collectionPath  Is the path of the structure of the data to read from Firebase
     * @return  Promise The promise contains the objects obtained from the Response of Firebase
     */
    fetchData(collectionPath) {
        return new Promise((resolve, reject) => {
            const ref = this.database.ref(collectionPath);
            // to keep reference of the FirebaseIO Object
            const that = this;
            
            // getting the full snapshot of a Path collection of Firebase
            ref.on('value', function(snapshot) {
                // firstly convert the snapshot records into an array and then resolve the promise
                resolve(that.snapshotToArray(snapshot));
            }, function(err) {
                // in case of errors
                reject(err);
            });
        });
    }
    
    /**
     * snapshotToArray  takes a snapshot object of Firebase and returns all the childs into an array
     * @params  snapshot
     * @return  Array
     */
    snapshotToArray(snapshot) {
        const returnArray = [];
        
        try {
            // going by each of the first level childs of the snapshot
            snapshot.forEach(child => {
                let item = {};
                
                // recovering the key
                item.key = child.key;
                // getting all the values of the child
                item = { ...child.val(), ...item };
                
                // adding it to the array to return
                returnArray.push(item);
            });
        }
        catch(err) {
            this.logger.debug(JSON.stringify(err.stack));
        }

        return returnArray;
    }
}

module.exports = FirebaseIO;