const express = require('express');
const router = express.Router();
const db = require('../db_files/db')

router.post('/emailExists', async (req, res) => {
  const email = req.body.email.toString().toLowerCase();
  const type = req.body.type.toString().toUpperCase();
  console.log(email);
  console.log(type);
  db.query('select EMAIL from ?? where EMAIL = ?', [type, email],  async (err, rows) => {
    if(err) throw err;
    if(rows.length >= 1) {
      res.status(302).send();
    }
    else {
      // If email exists
      res.status(404).send();
    }
  })
})

module.exports = router;