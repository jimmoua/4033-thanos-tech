const express = require('express');
const router = express.Router();
const db = require('../db_files/db');
const {v4: uuid} = require('uuid');
const bcrypt = require('bcrypt');
const ACCOUNT = require('../misc/accountTypes');

router.post('/:type', (req, res) => {
  // const foo = req.params.type;
  const type = req.params.type;
  console.log(type);
  console.log(ACCOUNT.STUDENT);
  switch(type) {
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
            // If result == true, the provided password was correct
            if(result) {
              req.session.loggedIn = true;
              req.session.loggedInType = ACCOUNT.STUDENT;
              req.session.acc_no = results[0].ACC_NO;
              req.session.pacc_no = results[0].PARENT_ACC_NO;
              req.session.name = results[0].FNAME + " " + results[0].LNAME;
              req.session.email = results[0].EMAIL;
              if(req.session.pacc_no !== null) {
                db.query(`SELECT EMAIL FROM PARENT WHERE ACC_NO = ${req.session.pacc_no};`, (err, result3) => {
                  if(err) throw err;
                  req.session.pemail = result3[0].EMAIL;
                })
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
            // If result == true, the provided password was correct
            if(result) {
              req.session.loggedIn = true;
              req.session.loggedInType = ACCOUNT.PARENT;
              req.session.name = results[0].FNAME + " " + results[0].LNAME;
              req.session.acc_no = results[0].ACC_NO;
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
      break;
    }
    default: {
      res.status(500).send('Account type did not match');
    }
  }
})

module.exports = router;