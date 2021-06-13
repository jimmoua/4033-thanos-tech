const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const store = new MySQLStore({
    host: process.env.TWT_RDS_HOST,
    user: process.env.TWT_RDS_USER,
    password: process.env.TWT_RDS_PASSWORD,
    database: process.env.TWT_RDS_DATABASE,
    port: process.env.TWT_RDS_PORT,
    clearExpired: true,
    checkExpirationInterval: 1000 * 900
});

module.exports = store;
