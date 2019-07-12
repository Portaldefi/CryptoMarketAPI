var Mailchimp = require('mailchimp-api-v3')
var mailchimp = new Mailchimp('73b07ce3e0bda1b5ec43c38ecd70a43d-us9');
const { Client } = require('pg');
var mLab = require('mongolab-data-api')('QfJZ1lrjzJhI6vGhmbnQ-g6p64AmpOY8');

var pg_uri = 'postgres://xkerfoysjdggak:6503eb5c44eda02d8c76010812894c4f0c81ed1d4ab7a22721b7916e82df592a@ec2-54-227-246-152.compute-1.amazonaws.com:5432/d7cghpkqthhp00';
var calls = [];
var cryptonaut_list = 'b673bef3ed';
var portal_list = 'd67a63b709';

var options = {
  database: 'heroku_ll9nqvpn',
  collectionName: 'UserAuth',
  query: '',
  limit:50000
};

const client = new Client({
  connectionString: pg_uri,
  ssl: true,
});

client.connect();

client.query('SELECT email FROM emails;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    addtoMailchimp(row.email,portal_list);
  }
  client.end();
  
  mLab.listDocuments(options, function (err, data) {
      for (var i=0;i<data.length;i++){
        var lead = data[i];
        addtoMailchimp(lead.email,cryptonaut_list);
      }
    });
  
  mailchimp.batch(calls, {}, {
      wait : true,
      interval : 2000,
      unpack : true,
    });
});

function addtoMailchimp(email,listid){
     calls.push({
          method : 'post',
          path : '/lists/'+listid+'/members',
          body : {
            email_address : email,
            status : 'subscribed'
          }
    })
}