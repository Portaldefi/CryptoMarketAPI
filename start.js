
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





