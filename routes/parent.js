const express = require('express')
const router = express.Router();
const db = require('../db_files/db');
const ACCOUNT = require('../misc/accountTypes');
const {v4: uuid} = require('uuid');

router.get('/scheduledappointments', (req, res) => {
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
})

module.exports = router;