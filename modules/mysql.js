

var mysql      = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'root',
  password        : '1121ujung',
  database        : 'sleeplog'
});
module.exports = pool;
