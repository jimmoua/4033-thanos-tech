const express = require('express')
const router = express.Router();
const ACCOUNT = require('../misc/accountTypes');

// * This is the routing for '/' get requests.
// In other words, if users requests to go to our domain, what should be the
// first thing that renders to them?
router.get('/', (req, res) => {
  if(!req.session.loggedIn) {
    res.render("index")
  }
  else {
    switch(req.session.loggedInType) {
      case ACCOUNT.TUTOR: {
        // Render the tutor view
        res.send(`You're logged in as a ${req.session.loggedInType}`)
        break;
      }
      case ACCOUNT.PARENT: {
        // Render the parent view
        res.send(`You're logged in as a ${req.session.loggedInType}`)
        break;
      }
      case ACCOUNT.STUDENT: {
        // Render the student view
        // res.render("student/homepage")
        const name = req.session.userName;
        res.render('student/homepage', {
          name
        });
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
  if(req.session.loggedIn) {
    // Render a page telling them they are already logged in
    res.send(`You're already logged in! Please sign out to register.`);
  }
  else {
    res.render('register');
  }
})

router.get('/login', (req, res) => {
  if(req.session.loggedIn) {
    // Tell the use that they are already logged in, and redirect them to the home page view.
    res.send(`You're already logged in!`);
  }
  else {
    res.render('login')
  }
})

router.get('/editProfile', (req, res) => {
  if(!req.session.loggedIn) {
    res.redirect('/');
  }
  else {
    res.render('editProfile', {
      session: req.session
    })
  }
})

module.exports = router;
