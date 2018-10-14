const firebase = require('firebase-admin');
// importing the database connection parameters
const dbConf = require("../config/db.js");

class FirebaseIO {
    
    constructor() {
        console.log('FirebaseIO turn on engines!');
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
            
            ref.on('value', function(snapshot) {
                resolve(snapshot.val());
            }, function(err) {
                reject(err);
            });
        });
    }
}

module.exports = FirebaseIO;