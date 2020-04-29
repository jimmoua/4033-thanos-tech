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
    if(req.query.aptid) {
      const aptid = req.query.apt;
      db.query(`SELECT APPOINTMENTS.APPOINTMENT_ID AS ID, APPOINTMENTS.STATUS AS STATUS, COURSES.COURSE_NAME AS COURSE, STUDENT.FNAME AS FNAME, STUDENT.LNAME AS LNAME, STUDENT.EMAIL AS EMAIL, APPOINTMENTS.APPOINTMENT_DATE AS DATE, APPOINTMENTS.APPOINTMENT_TIME AS TIME FROM APPOINTMENTS LEFT JOIN STUDENT ON APPOINTMENTS.STUDENT_ID = STUDENT.ACC_NO LEFT JOIN COURSES ON APPOINTMENTS.COURSE = COURSES.COURSE_ID WHERE APPOINTMENTS.APPOINTMENT_ID = ? GROUP BY APPOINTMENT_ID `, [req.query.aptid], (err, results) => {
        if(err) throw err; 
        if (results.length == 0) {
          res.send(`No appointments found!`)
          return; 
        } else if (results.length > 1) {
          res.send(`Multiple appointment selected`)
          return; 
        } else {
          res.json({
            // * Shorten the pass by passing it as an object instead of individual items.
            apt: results[0]
          })
        }
      })
      return; 
    }
    else {
      db.query(`SELECT APPOINTMENTS.APPOINTMENT_ID AS ID, APPOINTMENTS.STATUS AS STATUS, COURSES.COURSE_NAME AS COURSE, STUDENT.EMAIL AS EMAIL, APPOINTMENTS.APPOINTMENT_DATE AS DATE, APPOINTMENTS.APPOINTMENT_TIME AS TIME FROM APPOINTMENTS LEFT JOIN STUDENT ON APPOINTMENTS.STUDENT_ID = STUDENT.ACC_NO LEFT JOIN COURSES ON APPOINTMENTS.COURSE = COURSES.COURSE_ID WHERE APPOINTMENTS.TUTOR_ID = ? GROUP BY APPOINTMENT_ID `, [req.session.user.acc_no], (err, results) => {
        if(err) {
          res.json(err);
          return;
        }
        res.render('tutor/scheduledappointment', {
          apmt: results
        });         
      });
    }    
  }
})

router.get('/income', (req, res) => {
  if(!req.session.user || req.session.user.type != ACCOUNT.TUTOR) {
    res.redirect('/'); 
  }
  else {
    res.render('tutor/income');
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


router.get('/messages', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.TUTOR) {
    res.redirect('/');
    return;
  }
  if(!req.query.view) {
    db.query(`select MESSAGES.STUDENT, STUDENT.FNAME, STUDENT.LNAME, STUDENT.EMAIL FROM MESSAGES right outer join TUTOR on TUTOR.ACC_NO in(MESSAGES.TUTOR) right outer join STUDENT on STUDENT.ACC_NO in (MESSAGES.STUDENT) where MESSAGES.TUTOR = ? GROUP BY MESSAGES.STUDENT;`, [req.session.user.acc_no], (err, results) => {
      if(err) {
        res.json(err);
        return;
      }
      res.render('tutor/messages', {
        msg: results
      })
    })
    return;
  } else {
    // * If there is a query to view a message id
    if(req.query.view) {
      // TODO: Send messages of student and tutor to EJS file.
      db.query(`select MESSAGES.MESSAGE, MESSAGES.SENDER, MESSAGES.STUDENT, STUDENT.FNAME, STUDENT.LNAME FROM MESSAGES right outer join TUTOR on TUTOR.ACC_NO in(MESSAGES.TUTOR) right outer join STUDENT on STUDENT.ACC_NO in (MESSAGES.STUDENT) where MESSAGES.TUTOR = ? ORDER BY TIME ASC;`, [req.session.user.acc_no], (err, results) => {
        if(err) {
          res.json(err);
          return;
        }
        res.render('tutor/messageView', {
          msg: results
        })
      })
    }
  }
})
module.exports = router;