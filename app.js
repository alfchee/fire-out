const program = require('commander');
//import { ETL } from './etl.js';
const ETL = require('./etl.js');

// setting the version of the app
program.version('0.0.1', '-v, --version');

program
    .command('load-data [options]')
    .option('--firebase_collection <collName>', 'Set the Firebase Collection')
    .action((env, options) => {
        console.log(env, options.firebase_collection);
        // instantiating the ETL class
        const etl = new ETL({
            firebaseCollection: options.firebase_collection
        });
        // starting the process of pull from Firebase and send the data to DynamoDB
        etl.pullFromFirebasePushToDynamoDB();
    });

// passing the arguments to start the app
program.parse(process.argv);