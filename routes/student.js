const express = require('express')
const router = express.Router();
const db = require('../db_files/db');

router.get('/search', (req, res) => {
  if (!req.session.user) {
    res.redirect('/'); 
  }
  else {
    res.render('student/search');
  }  
})

router.get('/scheduledappointments', (req, res) => {
  if (!req.session.user) {
    res.redirect('/'); 
  }
  else {
    res.render('student/scheduledappointment')
  }
});

router.get('/managepayments', (req, res) => {
  if (!req.session.user) {
    res.redirect('/'); 
  }
  else {
    res.render('student/managepayment')
  }
});

router.get('/appointmenthistory', (req, res) => {
  if (!req.session.user) {
    res.redirect('/'); 
  }
  else {
    res.render('student/appointmenthistory')
  }
});

router.get('/editProfile', (req, res) => {
  if (!res.session.user) {
    res.redirect('/'); 
  }
  else {
    db.query(`select * from STUDENT where ACC_NO = '${req.session.user.acc_no}'`, (err, results) => {
      if(err) throw err;
      res.render(`student/editProfile`, {
        name: results[0].FNAME + " " + results[0].LNAME,
        user: req.session.user,
        profile: results
      })
    })
  }
});

router.get('/setparrentacc', (req, res) => {
  if (!res.session.user) {
    res.redirect('/'); 
  }
  else {
    db.query(`select * from STUDENT where ACC_NO = '${req.session.user.acc_no}'`, (err, s_results) => {
      if(err) throw err;
      db.query(`select * from PARENT where ACC_NO = '${s_results[0].PARENT_ACC_NO}'`, (err, p_results) => {
        if(err) throw err;
        res.render('student/setParentAcc', {
          user: s_results[0].FNAME + " " + s_results[0].LNAME,
          pemail: (p_results.length != 0 ? p_results[0].EMAIL : false)
        })
      })
    })
  }
})

module.exports = router;