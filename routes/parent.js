const express = require('express')
const router = express.Router();
const db = require('../db_files/db');
const ACCOUNT = require('../misc/accountTypes');
const {v4: uuid} = require('uuid');
const path = require('path');

router.get('/scheduledappointments', (req, res) => {
  // * If no user session defined or trying to spoof
  if(!req.session.user || req.session.user.type !== ACCOUNT.PARENT) {
    res.redirect('/')
  }
  

  // * If requesting to view given a key
  if(req.query.view) {
    const qstring =
    "select"+
      " APPOINTMENTS.APPOINTMENT_ID,"+
      " APPOINTMENTS.PLACE,"+
      " STUDENT.ACC_NO as SACCNO,"+
      " STUDENT.FNAME AS SFNAME,"+
      " STUDENT.LNAME AS SLNAME,"+
      " STUDENT.EMAIL AS SEMAIL,"+
      " TUTOR.ACC_NO AS TACCNO,"+
      " TUTOR.FNAME AS TFNAME,"+
      " TUTOR.LNAME AS TLNAME,"+
      " TUTOR.EMAIL AS TEMAIL,"+
      " APPOINTMENTS.APPOINTMENT_DATE AS DATE,"+
      " APPOINTMENTS.APPOINTMENT_TIME AS TIME,"+
      " APPOINTMENTS.STATUS,"+
      " COURSES.COURSE_NAME"+
    " from STUDENT"+
    " right outer join APPOINTMENTS on STUDENT.ACC_NO in(APPOINTMENTS.STUDENT_ID)"+
    " right outer join TUTOR ON APPOINTMENTS.TUTOR_ID IN(TUTOR.ACC_NO)"+
    " right outer join COURSES ON COURSES.COURSE_ID IN(APPOINTMENTS.COURSE)"+
    " where APPOINTMENTS.APPOINTMENT_ID = ?"+
    " and APPOINTMENTS.STATUS = 'ACCEPTED'"+
    " or APPOINTMENTS.STATUS = 'PENDING'";
    const aptid = req.query.view;
    db.query(qstring, [aptid], (err, results) => {
      if(err) {
        res.json(err);
        return;
      }
      if(results.length == 0) {
        res.status(404).sendFile(path.resolve('public/html/404.html'));
        return;
      }
      res.render('parent/scheduleview.ejs', {
        apt: results[0]
      })
    })
    return;
  }
  else {
    const qstring =
      "select"+
        " APPOINTMENTS.APPOINTMENT_ID,"+
        " APPOINTMENTS.PLACE,"+
        " STUDENT.ACC_NO as SACCNO,"+
        " STUDENT.FNAME AS SFNAME,"+
        " STUDENT.LNAME AS SLNAME,"+
        " STUDENT.EMAIL AS SEMAIL,"+
        " TUTOR.ACC_NO AS TACCNO,"+
        " TUTOR.FNAME AS TFNAME,"+
        " TUTOR.LNAME AS TLNAME,"+
        " TUTOR.EMAIL AS TEMAIL,"+
        " APPOINTMENTS.APPOINTMENT_DATE AS DATE,"+
        " APPOINTMENTS.APPOINTMENT_TIME AS TIME,"+
        " APPOINTMENTS.STATUS,"+
        " COURSES.COURSE_NAME"+
      " from STUDENT"+
      " right outer join APPOINTMENTS on STUDENT.ACC_NO in(APPOINTMENTS.STUDENT_ID)"+
      " right outer join TUTOR ON APPOINTMENTS.TUTOR_ID IN(TUTOR.ACC_NO)"+
      " right outer join COURSES ON COURSES.COURSE_ID IN(APPOINTMENTS.COURSE) where PARENT_ACC_NO = ?"+
      " AND APPOINTMENTS.STATUS != 'FINISHED'"+
      " AND APPOINTMENTS.STATUS != 'CANCELLED'";
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

// * Parent routing to manage payment
router.get('/managepayments', (req, res) => {
  if(!req.session.user || req.session.user.type != ACCOUNT.PARENT) {
    res.redirect('/')
    return;
  }
  if(req.query.tid) {
    const qstring =
      "SELECT"+
        " TR.TRANSACTION_ID,"+
        " TR.STATUS,"+
        " S.FNAME AS SFNAME,"+
        " S.LNAME AS SLNAME,"+
        " S.EMAIL AS SEMAIL,"+
        " T.FNAME AS TFNAME,"+
        " T.LNAME AS TLNAME,"+
        " T.EMAIL AS TEMAIL,"+
        " C.COURSE_NAME,"+
        " A.APPOINTMENT_ID"+
      " FROM TRANSACTIONS TR"+
      " RIGHT OUTER JOIN STUDENT S ON TR.STUDENT_ID IN(S.ACC_NO)"+
      " RIGHT OUTER JOIN TUTOR T ON TR.TUTOR_ID IN (T.ACC_NO)"+
      " RIGHT OUTER JOIN APPOINTMENTS A ON TR.APPOINTMENT_ID IN(A.APPOINTMENT_ID)"+
      " RIGHT OUTER JOIN COURSES C ON A.COURSE IN(C.COURSE_ID)"+
      " WHERE TR.TRANSACTION_ID = ?"+
      " AND TR.STATUS = 'NOT PAID'";
    db.query(qstring, [req.query.tid], (err, results) => {
      if(err) {
        res.json(err)
        return;
      }
      if(results.length == 0) {
        res.status(404).sendFile(path.resolve('public/html/404.html'));
      }
      res.render('parent/payview', {
        p: results[0]
      })
    })
    return;
  }
  const qstring =
    " SELECT"+
      " TR.TRANSACTION_ID,"+
      " TR.STATUS,"+
      " TR.AMOUNT,"+
      " S.FNAME AS SFNAME,"+
      " S.LNAME AS SLNAME,"+
      " S.EMAIL AS SEMAIL,"+
      " T.FNAME AS TFNAME,"+
      " T.LNAME AS TLNAME,"+
      " T.EMAIL AS TEMAIL"+
    " FROM TRANSACTIONS TR"+
    " RIGHT OUTER JOIN STUDENT S ON TR.STUDENT_ID IN(S.ACC_NO)"+
    " RIGHT OUTER JOIN TUTOR T ON TR.TUTOR_ID IN (T.ACC_NO)"+
    " WHERE S.PARENT_ACC_NO = ?"+
    " AND TR.STATUS = 'NOT PAID'";
  db.query(qstring, [req.session.user.acc_no], (err, results) => {
    if(err) {
      res.status(500).json(err);
      return;
    }
    res.render('parent/pay', {
      p: results
    })
  })
})

router.get('/paymenthistory', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.PARENT) {
    res.redirect('/')
  }
  else {
    const qstring =
    " SELECT"+
      " TR.STATUS,"+
      " TR.TRANSACTION_ID,"+
      " C.COURSE_NAME,"+
      " A.APPOINTMENT_ID,"+
      " S.FNAME AS SFNAME,"+
      " S.LNAME AS SLNAME"+
    " FROM TRANSACTIONS TR"+
    " INNER JOIN APPOINTMENTS A ON TR.APPOINTMENT_ID IN(A.APPOINTMENT_ID)"+
    " INNER JOIN COURSES C ON A.COURSE IN(C.COURSE_ID)"+
    " INNER JOIN STUDENT S ON TR.STUDENT_ID IN (S.ACC_NO)"+
    " WHERE TR.PAID_BY = ?"+
    " AND TR.STATUS = 'PAID';"
    db.query(qstring, [req.session.user.acc_no], (err, results) => {
      if(err) {
        res.json(err)
        return;
      }
      res.render('parent/paymenthistory', {
        t: results
      })
    })
    return;
  }
})

router.get('/appointmenthistory', (req, res) => {
  if(!req.session.user || req.session.user.type != ACCOUNT.PARENT) {
    res.redirect('/');
    return;
  }

  const qstring = 
    "SELECT"+
      " TR.APPOINTMENT_ID,"+
      " C.COURSE_NAME,"+
      " S.FNAME AS SFNAME,"+
      " S.LNAME AS SLNAME,"+
      " S.EMAIL AS SEMAIL,"+
      " T.EMAIL AS TEMAIL,"+
      " T.FNAME AS TFNAME,"+
      " T.LNAME AS TLNAME"+
    " FROM TRANSACTIONS TR"+
    " INNER JOIN APPOINTMENTS A ON TR.APPOINTMENT_ID IN(A.APPOINTMENT_ID)"+
    " INNER JOIN COURSES C ON A.COURSE IN(C.COURSE_ID)"+
    " INNER JOIN STUDENT S ON A.STUDENT_ID IN(S.ACC_NO)"+
    " INNER JOIN TUTOR T ON A.TUTOR_ID IN(T.ACC_NO)"+
    " WHERE TR.PAID_BY = ?"+
    " OR S.PARENT_ACC_NO = ?";
    db.query(qstring, [req.session.user.acc_no, req.session.user.acc_no], (err, results) => {
      if(err) {
        res.status(500).json(err);
        return;
      }
      res.render('parent/appointmenthistory', {
        r: results
      });
    })

})

router.get('/seechildren', (req, res) => {
  if(!req.session.user || req.session.user.type != ACCOUNT.PARENT) {
    res.redirect('/')
    return;
  }
  // Otherwise... if session is valid
  const qstring = 
  "SELECT"+
    " ACC_NO,"+
    " FNAME,"+
    " LNAME,"+
    " EMAIL"+
  " FROM STUDENT"+
  " WHERE PARENT_ACC_NO = ?";
  db.query(qstring, [req.session.user.acc_no], (err, results) => {
    if(err) {
      res.status(500).json(err);
      return;
    }
    res.render('parent/seechildren', {
      r: results
    })
  })
})

module.exports = router;