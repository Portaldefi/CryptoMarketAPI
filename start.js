
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;
mongoose.connection
    .on('connected', () => {
    console.log(`Mongoose connection open on ${process.env.DATABASE}`);
})
.on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
});

global.fetch = require('node-fetch')

const app = require('./app');
var server = require("http").Server(app);


server.listen(process.env.PORT || 3000, () => {
    console.log(`Express is running on port ${server.address().port}`);
});

var apn = require('apn');
var apnsoptions = {
    token: {
      key: "public/push/AuthKey_FM695U6F8J.p8",
      keyId: "FM695U6F8J",
      teamId: "HBPT8C8527"
    },
    production: false
};

const Queue = require('bull');
const alertQueue = new Queue('queue', process.env.REDIS_URL)

alertQueue.process(function (job, done) {
    var apnProvider = new apn.Provider(apnsoptions);
    Push.send_ios_notification(job.data.alert_token,job.data.alert_price,apnProvider);
    console.log("sending message");
    apnProvider.shutdown();
});

