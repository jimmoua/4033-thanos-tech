const mysql = require('mysql');
const connection = mysql.createConnection({
  host: '***REMOVED***.cxcs9abwkocb.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: '***REMOVED***tech',
  database: 'innodb'
})

module.exports = connection;