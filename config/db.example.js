const databases = {
    firebase: {
        cert: {
            "type": "service_account",
            "project_id": "project-id",
            "private_key_id": "this-is-a-private-key-id",
            "private_key": "-----BEGIN PRIVATE KEY-----\n-----END PRIVATE KEY-----\n",
            "client_email": "something-here.iam.gserviceaccount.com",
            "client_id": "a-number-here",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-project-id-here.iam.gserviceaccount.com"
        },
        databaseURL: "https://project-id.firebaseio.com"
    },
    
    dynamodb: null
};

module.exports = databases;