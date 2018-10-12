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
}

module.exports = FirebaseIO;