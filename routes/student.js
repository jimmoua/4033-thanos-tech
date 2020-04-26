const express = require('express')
const router = express.Router();
const db = require('../db_files/db');

router.get('/search', (req, res) => {
  res.render('student/search');
})

router.get('/scheduledappointments', (req, res) => {
  res.render('student/scheduledappointment')
});

router.get('/managepayments', (req, res) => {
  res.render('student/managepayment')
});

router.get('/appointmenthistory', (req, res) => {
  res.render('student/appointmenthistory')
});

router.get('/editProfile', (req, res) => {
  db.query(`select * from STUDENT where ACC_NO = '${req.session.user.acc_no}'`, (err, results) => {
    if(err) throw err;
    const name = {
      fname: results[0].FNAME,
      lname: results[0].LNAME
    }
    res.render(`student/editProfile`, {
      name: name,
      user: req.session.user,
      profile: results,
      email: results[0].EMAIL
    })
  })
});

router.get('/setparrentacc', (req, res) => {
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
})

module.exports = router;