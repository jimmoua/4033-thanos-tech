const express = require('express');
const router = express.Router();

router
  .use('/', require('./home_views'))
  .use('/:type/:action', require('./homepageActions'))

module.exports = router;