

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1121ujung',
  database : 'sleepLog'
});

module.exports = connection;
