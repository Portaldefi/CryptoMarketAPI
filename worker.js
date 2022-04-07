let throng = require('throng');
let Queue = require("bull");
var Push = require('../push.js');

// Connect to a local redis instance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
let workers = process.env.WEB_CONCURRENCY || 2;

// The maximum number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network 
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
let maxJobsPerWorker = 100;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function start() {
    let alertQueue = new Queue('queue', REDIS_URL);

    alertQueue.process(function (job, done) {
        Push.send_ios_notification(job.data.alert_token,job.data.alert_price);
    });
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });