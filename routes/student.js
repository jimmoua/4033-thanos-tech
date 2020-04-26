const express = require('express')
const router = express.Router();
const db = require('../db_files/db');

router.get('/scheduledappointments', (req, res) => {
});

router.get('/managepayments', (req, res) => {
});

router.get('/appointmenthistory', (req, res) => {
});

router.get('/editProfile', (req, res) => {
  db.query(`select * from STUDENT where ACC_NO = '${req.session.user.acc_no}'`, (err, results) => {
    if(err) throw err;
    res.render(`student/editProfile`, {
      name: results[0].FNAME + " " + results[0].LNAME,
      user: req.session.user,
      profile: results
    })
  })
});

router.get('/setparrentacc', (req, res) => {
  db.query(`select * from STUDENT where ACC_NO = '${req.session.user.acc_no}'`, (err, s_results) => {
    if(err) throw err;
    db.query(`select * from PARENT where ACC_NO = '${s_results[0].PARENT_ACC_NO}'`, (err, p_results) => {
      if(err) throw err;
      console.log(s_results[0].FNAME + " " + s_results[0].LNAME);
      res.render('student/setParentAcc', {
        user: s_results[0].FNAME + " " + s_results[0].LNAME,
        pemail: (p_results.legnth != 0 ? p_results[0].EMAIL : false)
      })
    })
  })
})

module.exports = router;