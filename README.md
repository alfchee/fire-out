
##Dependencies
* NodeJS 8.12.0
* Firebase SDK
* AWS SDK
* Commander

##How Setup
* Clone this repo
* Install dependencies using `npm install`
* Copy the file `db.example.js` into `db.js` and add your Firebase credentials
* Add your AWS credentials in `~/.aws/credentials`

##How to use this app
This is a CLI NodeJS application the commands are

* node app.js --help    To display the helper
* node app.js load-data -s <source> --firebase-collection </path>

##Useful links
* AWS Credentials https://docs.aws.amazon.com/es_es/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html
* AWS SDK API https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/