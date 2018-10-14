const program = require('commander');
//import { ETL } from './etl.js';
const ETL = require('./etl.js');

// setting the version of the app
program.version('0.0.1', '-v, --version');

program
    .command('load-data [options]')
    .option('-s, --source <source>', 'Set the source connection')
    .option('--firebase-collection <collName>', 'Set the Firebase Collection')
    .option('-p, --process-it', 'Boolean, set if the data needs to be processed/transformed before push to destiny', false)
    .action((env, options) => {
        // console.log(env, options.firebase_collection);
        // instantiating the ETL class
        const etl = new ETL({
            source: options.source,
            firebaseCollection: options.firebaseCollection,
            processIt: options.processIt
        });
        
        if(options.source == 'firebase') {
            // starting the process of pull from Firebase and send the data to DynamoDB
            etl.pullFromFirebasePushToDynamoDB();
        }
    });

// passing the arguments to start the app
program.parse(process.argv);