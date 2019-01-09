
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
const cc = require('cryptocompare')

const app = require('./app');
var server = require("http").Server(app);

var io = require('socket.io')();
io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});
require("./ws.js")(io);
exports.io = io;

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Express is running on port ${server.address().port}`);
});
