const express = require('express');
const router = express.Router();
const db = require('../db_files/db');
const {v4: uuid} = require('uuid');
const bcrypt = require('bcrypt');


// POST Method for /api/registerStudent
router.post("/api/registerStudent", (req, res) => {
  const fname = req.body.firstName;
  const lname = req.body.lastName;
  const email = req.body.email;
  const pass1 = req.body.password1;
  const pass2 = req.body.password2;
  if(pass1 !== pass2) {
    res.status(400).send('Bad Request');
  }
  else {
    // Encrypt the password before storing it
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, (err, salt) => {
      bcrypt.hash(pass1, salt, (err, hash) => {
        const accID = uuid();
        // * Check to see if email exists in the database already.
        db.query(`SELECT * FROM STUDENT WHERE EMAIL = '${email}'`, (err, results) => {
          if(err) throw err;
          // * If email exists, send them a page telling them
          if(results.length > 0) {
            res.send(`A user with the email "${email}" already exists.`);
            exists = true;
          } else {
            db.query(`INSERT INTO STUDENT ( ACC_NO, FNAME, LNAME, EMAIL, PASSWORD ) VALUES( '${accID}', '${fname}', '${lname}', '${email}', '${hash}' );`, (err, results) => {
              if(err) throw err;
              console.log(results);
            })
            // ! The query below is just for debugging purposes.
            db.query(`SELECT * FROM STUDENT WHERE ACC_NO = '${accID}'`, (err, results) => {
              if(err) throw err;
              console.log(results);
            })
            res.send(`You've registered with the account: "${email}"
            Redirecting to the login page in 3 seconds.
            <script>
            setTimeout(function() {
              window.location.href='/login'
            }, 3000);
            </script>
            `)
          }
        })
      })
    })
  }
})

// POST method for /api/registerTutor
router.post("/api/registerTutor", (req, res) => {
  const firstName = req.body.firstName; 
  const lastName = req.body.lastName; 
  const email = req.body.email; 
  const classLevel = req.body.classLevel; 
  const schoolName = req.body.schoolName; 
  const street = req.body.street; 
  const city = req.body.city; 
  const state = req.body.state; 
  const phoneNum = req.body.phoneNum; 
  const DOB = req.body.DOB; 

  // To do: send this data to database
  res.send(`${firstName} ${lastName} registered as a tutor`); 
})

module.exports = router;