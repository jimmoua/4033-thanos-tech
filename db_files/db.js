const mysql = require('mysql');
const connection = mysql.createConnection({
  host: process.env.TWT_RDS_HOST,
  user: process.env.TWT_RDS_USER,
  password: process.env.TWT_RDS_PASSWORD,
  database: process.env.TWT_RDS_DB
})

module.exports = connection;
