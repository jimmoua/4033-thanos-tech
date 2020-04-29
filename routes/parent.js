const express = require('express')
const router = express.Router();
const db = require('../db_files/db');
const ACCOUNT = require('../misc/accountTypes');
const {v4: uuid} = require('uuid');

router.get('/scheduledappointments', (req, res) => {
  // * If no user session defined or trying to spoof
  if(!req.session.user || req.session.user.type !== ACCOUNT.PARENT) {
    res.redirect('/')
  }
  

  // * If requesting to view given a key
  if(req.query.view) {
    const qstring = `select	APPOINTMENTS.APPOINTMENT_ID, APPOINTMENTS.PLACE, STUDENT.ACC_NO as SACCNO, STUDENT.FNAME AS SFNAME, STUDENT.LNAME AS SLNAME, STUDENT.EMAIL AS SEMAIL, TUTOR.ACC_NO AS TACCNO, TUTOR.FNAME AS TFNAME, TUTOR.LNAME AS TLNAME, TUTOR.EMAIL AS TEMAIL, APPOINTMENTS.APPOINTMENT_DATE AS DATE, APPOINTMENTS.APPOINTMENT_TIME AS TIME, APPOINTMENTS.STATUS, COURSES.COURSE_NAME from STUDENT right outer join APPOINTMENTS on STUDENT.ACC_NO in(APPOINTMENTS.STUDENT_ID) right outer join TUTOR ON APPOINTMENTS.TUTOR_ID IN(TUTOR.ACC_NO) right outer join COURSES ON COURSES.COURSE_ID IN(APPOINTMENTS.COURSE) where APPOINTMENTS.APPOINTMENT_ID = ?`
    const aptid = req.query.view;
    db.query(qstring, [aptid], (err, results) => {
      if(err) {
        res.json(err);
        return;
      }
      res.render('parent/scheduleview.ejs', {
        apt: results[0]
      })
    })
    return;
  }
  else {
    const qstring = `select	APPOINTMENTS.APPOINTMENT_ID, APPOINTMENTS.PLACE, STUDENT.ACC_NO as SACCNO, STUDENT.FNAME AS SFNAME, STUDENT.LNAME AS SLNAME, STUDENT.EMAIL AS SEMAIL, TUTOR.ACC_NO AS TACCNO, TUTOR.FNAME AS TFNAME, TUTOR.LNAME AS TLNAME, TUTOR.EMAIL AS TEMAIL, APPOINTMENTS.APPOINTMENT_DATE AS DATE, APPOINTMENTS.APPOINTMENT_TIME AS TIME, APPOINTMENTS.STATUS, COURSES.COURSE_NAME from STUDENT right outer join APPOINTMENTS on STUDENT.ACC_NO in(APPOINTMENTS.STUDENT_ID) right outer join TUTOR ON APPOINTMENTS.TUTOR_ID IN(TUTOR.ACC_NO) right outer join COURSES ON COURSES.COURSE_ID IN(APPOINTMENTS.COURSE) where PARENT_ACC_NO = ?`
    db.query(qstring, [req.session.user.acc_no], (err, results) => {
      if(err) {
        res.json(err);
        return;
      }
      res.render('parent/scheduledappointments', {
        apt: results
      })
    })
  }
})

module.exports = router;