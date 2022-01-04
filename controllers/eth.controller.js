const async = require('async')
var asyncLoop = require('node-async-loop');

let Ethplorer = require('ethplorer-js').Ethplorer;
let api = new Ethplorer();

var Coin = require('../models/Coin');


exports.erc20_list = (req, res) => {
   res.setHeader('Content-Type', 'application/json');

   var path = require('path');
   var tokens = path.resolve('./public/tokens.json');

   const fs = require('fs')

    fs.readFile(tokens, 'utf8' , (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        res.status(200).send(data);
    });

}