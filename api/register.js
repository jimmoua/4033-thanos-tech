const express = require('express');
const router = express.Router();
const db = require('../db_files/db');
const {v4: uuid} = require('uuid');
const bcrypt = require('bcrypt');
const ACCOUNT = require('../misc/accountTypes');

// * This may look like spaghetti, and maybe it is, but it works so let's leave it (for now).
router.post('/:type', (req, res) => {
  const fname = req.body.firstName.charAt(0).toUpperCase() + req.body.firstName.slice(1).toLowerCase();
  const lname = req.body.lastName.charAt(0).toUpperCase() + req.body.lastName.slice(1).toLowerCase();
  const email = req.body.email;
  const pass1 = req.body.password1;
  const pass2 = req.body.password2;
  if(pass1 !== pass2) {
    res.status(400).send('Bad Request');
  }
  let good = true;
  const saltRounds = 10;
  switch(req.params.type) {
    case ACCOUNT.STUDENT: {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(pass1, salt, (err, hash) => {
          const accID = uuid();
          db.query(`SELECT * FROM STUDENT WHERE EMAIL = ?`, [email], (err, results) => {
            if(err) throw err;
            if(results.length > 0) {
              good = false;
              res.send(`A user with the email "${email}" already exists.`);
            } else {
              db.query(`INSERT INTO STUDENT VALUES ( ?, ?, ?, ?, null, null, ?, null);`, [accID, fname, lname, email, hash], (err, results) => {
                if(err) throw err;
                console.log(results);
                res.send(`${fname} ${lname} You've registered with the account: "${email}" Redirecting to the login page in 3 seconds. <script>
                setTimeout(function() {
                  window.location.href='/login'
                }, 3000);
                </script>
                `)
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
          db.query(`SELECT * FROM TUTOR WHERE ACC_NO = ?`, [accID], (err, results) => {
            if (err) throw err; 
            if (results.length > 0) {
              res.send(`A user with the email: '${email}' already exists`); 
            }
            else {
              db.query(`INSERT INTO TUTOR VALUES (?, ?, ?, ?, null, ?, null)`, [accID, fname, lname, email, hash], (err, results) => {
                if (err) throw err; 
                console.log(results); 
              })
              db.query(`SELECT * FROM TUTOR WHERE ACC_NO = ?`, [accID], (err, results) => {
                if (err) throw err; 
                console.log(results); 
              })
              res.send(`You've registered with the account : "${email}"
              Redirecting to the login page in 3 seconds
              <script>
              setTimeout(function() {
                window.location.href='/login'
              }, 3000);
              </script>`)
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
            if(err) throw err;
            // * If email exists, send them a page telling them
            if(results.length > 0) {
              res.send(`A user with the email "${email}" already exists.`);
            } else {
              db.query(`INSERT INTO PARENT VALUES ( ?, ?, ?, ?, ? )`, [accID, fname, lname, email, hash], (err, results) => {
                if(err) throw err;
                console.log(results);
                res.send(`You've registered with the account: "${email}" Redirecting to the login page in 3 seconds.
                <script>
                setTimeout(function() {
                  window.location.href='/login'
                }, 3000);
                </script>
                `)
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