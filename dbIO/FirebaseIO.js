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
        // creating a short access to auth from inside the class
        this.auth = firebase.auth();
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
    
    fetchAllUsers(nextPageToken) {
        // let nextPageToken = null;
        let usersCollection = [];
        
        this.logger.info('Fetching all the users fromm Firebase...');
        
        return new Promise((resolve, reject) => {
            // List batch of users, 1000 at a time.
            this.auth.listUsers(1000, nextPageToken)
                .then(listUsersResult => {
                    if(listUsersResult.users.length > 0) {
                        this.logger.info('Getting a lot of users...');
                    
                        listUsersResult.users.forEach(userRecord => {
                            usersCollection.push(userRecord.toJSON());
                        });
                        
                        resolve(this.normalizeUsers(usersCollection));
                        // if(listUsersResult.pageToken) {
                        //     this.fetchAllUsers(listUsersResult.pageToken);
                        // }
                    } else {
                        this.logger.info('No more users to fetch...');
                        resolve(usersCollection);
                    }
                })
                .catch(err => {
                    this.logger.debug(JSON.stringify(err.stack));
                    reject(err);
                });
        });
    }
    
    
    normalizeUsers(usersCollection) {
        let normalizedUsers = [];
        
        this.logger.info('Normalizing users...');
        
        usersCollection.forEach(user => {
            let username = user.email.slice(0, user.email.indexOf('@'));
            
            let newuser = {
                'cognito:username': username,
                'name': '',
                'given_name': '',
                'family_name': '',
                'middle_name': '',
                'nickname': '',
                'preferred_username': '',
                'profile': '',
                'picture': '',
                'website': '',
                'email': user.email,
                'email_verified': user.emailVerified,
                'gender': '',
                'birthdate': '',
                'zoneinfo': '',
                'locale': '',
                'phone_number': '',
                'phone_number_verified': false,
                'address': '',
                'updated_at': '',
                'cognito:mfa_enabled': false
            };
            
            normalizedUsers.push(newuser);
        });
        
        return normalizedUsers;
    }
}

module.exports = FirebaseIO;