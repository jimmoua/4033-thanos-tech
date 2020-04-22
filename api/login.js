const express = require('express');
const router = express.Router();
const db = require('../db_files/db');
const {v4: uuid} = require('uuid');
const bcrypt = require('bcrypt');
const ACCOUNT = require('../misc/accountTypes');

router.post('/api/loginStudent', (req, res) => {
  const pass = req.body.password;
  const email = req.body.email;
  db.query(`SELECT * FROM STUDENT WHERE EMAIL = '${email}';`, (err, results) => {
    if(err) throw err;
    const hash = results[0].PASSWORD;
    bcrypt.compare(pass, hash, (err, result) => {
      // If result == true, the provided password was correct
      if(result) {
        req.session.loggedIn = true;
        req.session.loggedInType = ACCOUNT.STUDENT;
        res.send(`Hello, ${results[0].FNAME} ${results[0].LNAME}.`);
      }
      else {
        res.send(`Auth error!`)
      }
    })
  });
})

module.exports = router;