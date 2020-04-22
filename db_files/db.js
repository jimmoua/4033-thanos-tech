const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'thanos.cxcs9abwkocb.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'thanostech',
  database: 'innodb'
})

module.exports = connection;