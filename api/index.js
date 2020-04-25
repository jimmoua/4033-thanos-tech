const express = require('express')
const router = express.Router()

router
  .use('/login', require('./login'))
  .use('/register', require('./register'))
  .use('/users/', require('./users/'));

module.exports = router;