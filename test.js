global.fetch = require('node-fetch')

const cc = require('cryptocompare')
cc.priceMulti('BTC', 'USD')
.then(prices => {
  console.log(prices)
  // -> { BTC: { USD: 1114.63 } }
})