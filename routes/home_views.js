const express = require('express')
const router = express.Router();

// * This is the routing for '/' get requests.
// In other words, if users requests to go to our domain, what should be the
// first thing that renders to them?
router.get('/', (req, res) => {
  if(!req.session.loggedIn) {
    res.render("index")
  }
  else {
    switch(req.session.loggedInType) {
      case 'tutor': {
        // Render the tutor view
        break;
      }
      case 'parent': {
        // Render the parent view
        break;
      }
      case 'student': {
        // Render the student view
        break;
      }
      case 'child': {
        // Render the child view
        break;
      }
      default: {
        res.status(500).send("500 Internal Error. Please contact a developer.");
      }
    }
  }
})

// * Handling if the users choose to go to the register page.
router.get('/register', (req, res) => {
  if(req.session.loggedIn) {
    // Render a page telling them they are already logged in
  }
  else {
    res.render('register');
  }
})

router.get('/login', (req, res) => {
  if(req.session.loggedIn) {
    // Tell the use that they are already logged in, and redirect them to the home page view.
  }
  else {
    res.render('login')
  }
})

module.exports = router;