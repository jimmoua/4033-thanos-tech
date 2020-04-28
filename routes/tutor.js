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