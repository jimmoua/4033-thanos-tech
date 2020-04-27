const express = require('express')
const router = express.Router();
const db = require('../db_files/db');
const ACCOUNT = require('../misc/accountTypes');

router.get('/editprofile', (req, res) => {
  if (!req.session.user || req.session.user.type != ACCOUNT.TUTOR) {
    res. redirect('/'); 
  }
  else {
    const data = {
      table: 'TUTOR',
      acc_no: req.session.user.acc_no
    }
    db.query(`select FNAME, LNAME, EMAIL, GENDER, BIO from ?? where ACC_NO = ?`, [data.table, data.acc_no], (err, rows) => {
      db.query(`select * from COURSES where ACC_NO = ?`, [req.session.user.acc_no], (err, course_rows) => {
        if(err) throw err;
        else {
          res.render('tutor/editprofile', {
            fname : rows[0].FNAME,
            lname : rows[0].LNAME,
            email : rows[0].EMAIL,
            gender: rows[0].GENDER,
            bio   : rows[0].BIO,
            courses: (course_rows.length == 0 ? false : course_rows)
          })
        }
      })
    })
  }
})

router.get('/viewscheduledappointments', (req, res) => {
  if (!req.session.user || req.session.user.type != ACCOUNT.TUTOR) {
    res.redirect('/'); 
  }
  else {
    res.render('tutor/scheduledappointment');
  }
})

router.get('/manageincome', (req, res) => {
  if(!req.session.user || req.session.user.type != ACCOUNT.TUTOR) {
    res.redirect('/'); 
  }
  else {
    res.render('tutor/manageincome');
  }
})

router.get('/viewappointmenthistory', (req, res) => {
  if(!req.session.user || req.session.user.type != ACCOUNT.TUTOR) {
    res.redirect('/');
  }
  else {
    res.render('tutor/appointmenthistory')
  }
})

module.exports = router;