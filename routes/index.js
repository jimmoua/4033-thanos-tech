const express = require('express');
const router = express.Router();

router
  .use('/', require('./home_views'))
  .use('/student/', require('./student'))
  .use('/tutor/', require('./tutor'))
  .use('/parent/', require('./parent')); 

module.exports = router;