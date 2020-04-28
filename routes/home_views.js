const express = require('express')
const router = express.Router();
const ACCOUNT = require('../misc/accountTypes');
const db = require('../db_files/db');

// * This is the routing for '/' get requests.
// In other words, if users requests to go to our domain, what should be the
// first thing that renders to them?
router.get('/', (req, res) => {
  if(!req.session.user) {
    res.render("index")
  }
  else {
    switch(req.session.user.type) {
      case ACCOUNT.TUTOR: {
        // Render the tutor view
        db.query(`select * from TUTOR where ACC_NO = ?`, [req.session.user.acc_no], (err, t_results) => {
          if(err) throw err;
          res.render('tutor/homepage', {
            name: t_results[0].FNAME + " " + t_results[0].LNAME
          })
        })
        break;
      }
      case ACCOUNT.PARENT: {
        // Render the parent view
        res.send(`You're logged in as a ${ACCOUNT.PARENT}`)
        break;
      }
      case ACCOUNT.STUDENT: {
        // Render the student view
        db.query(`select * from STUDENT where ACC_NO = ?`, [req.session.user.acc_no], (err, results) => {
          if(err) throw err;
          res.render('student/homepage', {
            name: results[0].FNAME + " " + results[0].LNAME
          });
        })
        break;
      }
      default: {
        res.status(500).send("500 Internal Error. Please contact a developer.");
        // Destroy the session because we've done something wrong!
        req.session.destroy();
      }
    }
  }
})

// * Handling if the users choose to go to the register page.
router.get('/register', (req, res) => {
  if(req.session.user) {
    // Render a page telling them they are already logged in
    res.send(`You're already logged in! Please sign out to register.`);
  }
  else {
    res.render('register');
  }
})

router.get('/login', (req, res) => {
  if(req.session.user) {
    // Tell the use that they are already logged in, and redirect them to the home page view.
    res.send(`You're already logged in!`);
  }
  else {
    res.render('login')
  }
})

module.exports = router;
