const express = require('express');
const router = express.Router();
const db = require('../db_files/db');
const bcrypt = require('bcrypt');
const ACCOUNT = require('../misc/accountTypes');

router.post('/:type', (req, res) => {
  switch(req.params.type) {
    case ACCOUNT.STUDENT: {
      const pass = req.body.password;
      const email = req.body.email;
      db.query(`SELECT * FROM STUDENT WHERE EMAIL = '${email}';`, (err, results) => {
        if(err) throw err;
        if(results.length < 1) {
          res.send(`Auth error!`);
        }
        else {
          const hash = results[0].PASSWORD;
          bcrypt.compare(pass, hash, (err, result) => {
            if(err) throw err;
            if(result) {
              req.session.user = {
                acc_no: results[0].ACC_NO,
                type: ACCOUNT.STUDENT
              }
              res.redirect('/');
            }
            else {
              res.send(`Auth error!`)
            }
          })
        }
      });
      break;
    }
    case ACCOUNT.PARENT: {
      const pass = req.body.password;
      const email = req.body.email;
      console.log(email);
      db.query(`SELECT * FROM PARENT WHERE EMAIL = '${email}';`, (err, results) => {
        if(err) throw err;
        if(results.length < 1) {
          res.send(`Auth error: no matching`);
        }
        else {
          const hash = results[0].PASSWORD;
          bcrypt.compare(pass, hash, (err, result) => {
            if(err) throw err;
            if(result) {
              req.session.user = {
                acc_no: result[0].ACC_NO,
                type: ACCOUNT.PARENT
              }
              res.redirect('/');
            }
            else {
              res.send(`Auth error!`)
            }
          })
        }
      });
      break;
    }
    case ACCOUNT.TUTOR: {
      res.send('not implemented yet')
      break;
    }
    default: {
      res.status(500).send('Account type did not match');
    }
  }
})

module.exports = router;