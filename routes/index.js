const express = require('express');
const router = express.Router();

router
  .use('/', require('./home_views'))
  .use('/student/', require('./student'))

module.exports = router;