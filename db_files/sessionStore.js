const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const store = new MySQLStore({
    host: '***REMOVED***.cxcs9abwkocb.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: '***REMOVED***tech',
    database: 'innodb',
    clearExpired: true,
    checkExpirationInterval: 1000 * 900
});

module.exports = store;