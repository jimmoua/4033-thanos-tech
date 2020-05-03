const express = require('express');
const router = express.Router();
const db = require('../db_files/db');
const {v4: uuid} = require('uuid');
const bcrypt = require('bcrypt');
const ACCOUNT = require('../misc/accountTypes');
const path = require('path');

// * This may look like spaghetti, and maybe it is, but it works so let's leave it (for now).
router.post('/:type', (req, res) => {

  // * Check to see if the body names are actually valid, and that the client side
  // * did not try to change anything.
  const b = req.body;
  if(!b.firstName || !b.lastName || !b.email || !b.password1 || !b.password2) {
    return res.status(400).sendFile(path.resolve('public/html/400.html'));
  }

  const fname = req.body.firstName.charAt(0).toUpperCase() + req.body.firstName.slice(1).toLowerCase();
  const lname = req.body.lastName.charAt(0).toUpperCase() + req.body.lastName.slice(1).toLowerCase();
  const email = req.body.email;

  // REGEX for email validation
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return res.redirect(`/register?errType=${req.params.type.toLowerCase()}InvalidEmail`)
  }

  // * Check to see if the passwords match each other
  const pass1 = req.body.password1;
  const pass2 = req.body.password2;
  if(pass1 !== pass2) {
    return res.redirect(`/register?errType=${req.params.type.toLocaleLowerCase()}PasswordMismatch`)
  }

  // * Salts rounds for encryption
  const saltRounds = 10;
  switch(req.params.type) {
    case ACCOUNT.STUDENT: {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(pass1, salt, (err, hash) => {
          const accID = uuid();
          db.query(`SELECT * FROM STUDENT WHERE EMAIL = ?`, [email], (err, results) => {
            if(err) {
              return res.status(500).json(err);
            }
            if(results.length > 0) {
              good = false;
              res.send(`A user with the email "${email}" already exists.`);
            } else {
              db.query(`INSERT INTO STUDENT VALUES ( ?, ?, ?, ?, null, null, ?, null);`, [accID, fname, lname, email, hash], (err, results) => {
                if(err) {
                  return res.status(500).json(err);
                }
                console.log(results);
                return res.sendFile(path.resolve('public/html/loginredirect.html'))
              })
            }
          })
        })
      })
      break;
    }
    case ACCOUNT.TUTOR: {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(pass1, salt, (err, hash) => {
          const accID = uuid(); 
          db.query(`SELECT * FROM TUTOR WHERE EMAIL = ?`, [email], (err, results) => {
            if(err) {
              return res.status(500).json(err);
            }
            if (results.length > 0) {
              res.send(`A user with the email: '${email}' already exists`); 
            }
            else {
              db.query(`INSERT INTO TUTOR VALUES (?, ?, ?, ?, null, ?, null)`, [accID, fname, lname, email, hash], (err, results) => {
                if(err) {
                  return res.status(500).json(err);
                }
              })
              db.query(`SELECT * FROM TUTOR WHERE ACC_NO = ?`, [accID], (err, results) => {
                if(err) {
                  return res.status(500).json(err);
                }
              })
              return res.sendFile(path.resolve('public/html/loginredirect.html'))
            }
          })
        })
      })
      break;
    }
    case ACCOUNT.PARENT: {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(pass1, salt, (err, hash) => {
          const accID = uuid();
          // * Check to see if email exists in the database already.
          db.query(`SELECT * FROM PARENT WHERE EMAIL = ?`, [email], (err, results) => {
            if(err) {
              return res.status(500).json(err);
            }
            // * If email exists, send them a page telling them
            if(results.length > 0) {
              res.send(`A user with the email "${email}" already exists.`);
            } else {
              db.query(`INSERT INTO PARENT VALUES ( ?, ?, ?, ?, ? )`, [accID, fname, lname, email, hash], (err, results) => {
                if(err) {
                  return res.status(500).json(err);
                }
                return res.sendFile(path.resolve('public/html/loginredirect.html'))
              })
            }
          })
        })
      })
      break;
    }
  }
})

module.exports = router;