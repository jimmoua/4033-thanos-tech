const express = require('express')
const router = express.Router();
const db = require('../db_files/db');
const ACCOUNT = require('../misc/accountTypes');
const path = require('path');

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
      res.render('tutor/editprofile', {
        fname : rows[0].FNAME,
        lname : rows[0].LNAME,
        email : rows[0].EMAIL,
        gender: rows[0].GENDER,
        bio   : rows[0].BIO
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
      const qstring = 
      "SELECT APPOINTMENTS.PLACE,"+
      " TUTOR.FNAME AS TFNAME,"+
      " TUTOR.LNAME AS TLNAME,"+
      " TUTOR.EMAIL as TEMAIL,"+
      " APPOINTMENTS.APPOINTMENT_ID AS ID,"+
      " APPOINTMENTS.STATUS AS STATUS,"+
      " COURSES.COURSE_NAME AS COURSE,"+
      " STUDENT.FNAME AS FNAME,"+
      " STUDENT.LNAME AS LNAME,"+
      " STUDENT.EMAIL AS EMAIL,"+
      " APPOINTMENTS.APPOINTMENT_DATE AS DATE,"+
      " APPOINTMENTS.APPOINTMENT_TIME AS TIME"+
      " FROM APPOINTMENTS"+
      " LEFT OUTER JOIN STUDENT ON APPOINTMENTS.STUDENT_ID = STUDENT.ACC_NO"+
      " LEFT OUTER JOIN COURSES ON APPOINTMENTS.COURSE = COURSES.COURSE_ID"+
      " LEFT OUTER JOIN TUTOR ON APPOINTMENTS.TUTOR_ID IN(TUTOR.ACC_NO)"+
      " WHERE APPOINTMENTS.APPOINTMENT_ID = ?";
      db.query(qstring, [req.query.aptid], (err, results) => {
        if(err) {
          return res.status(500).json(err);
        }
        const date = results[0].DATE;
        const time = results[0].TIME;
        const nowEpoch = new Date(date+" "+time).getTime() - new Date().getTime();
        if(nowEpoch < 0 && results[0].STATUS == 'PENDING') {
          db.query(`UPDATE APPOINTMENTS SET STATUS = 'CANCELLED' WHERE APPOINTMENT_ID = ?`, [req.query.aptid], (err) => {
            if(err) {
              res.status(500).json(err);
              return;
            }
            return res.redirect('/tutor/viewscheduledappointments?oldDate=true');
          })
        }
        else if (results.length == 0) {
          res.send(`No appointments found!`)
          return; 
        } else if (results.length > 1) {
          res.send(`Multiple appointment selected`)
          return; 
        } else {
          const nowEpoch = new Date(results[0].DATE+" "+results[0].TIME).getTime() - new Date().getTime();
          res.render('tutor/specificappointment', {
            apt: results[0],
            passedEpoch: nowEpoch
          })
        }
      })
      return; 
    }
    else {
      db.query(`SELECT APPOINTMENTS.APPOINTMENT_ID AS ID, APPOINTMENTS.STATUS AS STATUS, COURSES.COURSE_NAME AS COURSE, STUDENT.EMAIL AS EMAIL, APPOINTMENTS.APPOINTMENT_DATE AS DATE, APPOINTMENTS.APPOINTMENT_TIME AS TIME FROM APPOINTMENTS LEFT JOIN STUDENT ON APPOINTMENTS.STUDENT_ID = STUDENT.ACC_NO LEFT JOIN COURSES ON APPOINTMENTS.COURSE = COURSES.COURSE_ID WHERE APPOINTMENTS.TUTOR_ID = ? AND (STATUS = 'PENDING' OR STATUS = 'ACCEPTED') GROUP BY APPOINTMENT_ID `, [req.session.user.acc_no], (err, results) => {
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
    // If the query field has details
    // details == transaction id
    if(req.query.details) {
      const qstring = 
        "SELECT"+
          " TRANSACTIONS.STATUS,"+
          " TRANSACTIONS.AMOUNT,"+
          " TRANSACTIONS.TRANSACTION_ID,"+
          " TRANSACTIONS.APPOINTMENT_ID,"+
          " COURSES.COURSE_NAME,"+
          " TUTOR.FNAME AS TFNAME,"+
          " TUTOR.LNAME AS TLNAME,"+
          " TUTOR.EMAIL AS TEMAIL,"+
          " STUDENT.FNAME AS SFNAME,"+
          " STUDENT.LNAME AS SLNAME,"+
          " STUDENT.EMAIL AS SEMAIL"+
        " FROM TRANSACTIONS"+
        " LEFT OUTER JOIN TUTOR ON TRANSACTIONS.TUTOR_ID IN(TUTOR.ACC_NO)"+
        " LEFT OUTER JOIN STUDENT ON TRANSACTIONS.STUDENT_ID IN(STUDENT.ACC_NO)"+
        " LEFT OUTER JOIN APPOINTMENTS ON TRANSACTIONS.APPOINTMENT_ID IN (APPOINTMENTS.APPOINTMENT_ID)"+
        " LEFT OUTER JOIN COURSES ON APPOINTMENTS.COURSE IN(COURSES.COURSE_ID)"+
        " WHERE TRANSACTIONS.TRANSACTION_ID = ?";
      db.query(qstring, [req.query.details], (err, results) => {
        if(err) {
          res.status(500).json(err);
          return;
        }
        if(results.length == 0) {
          res.sendFile(path.resolve('public/html/404.html'));
          return;
        }
        res.render('tutor/transactionview', {
          t: results[0]
        });
      })
      return;
    }
    const qstring =
      "SELECT" + 
      " STATUS, AMOUNT, TRANSACTION_ID, FNAME, LNAME" +
      " FROM TRANSACTIONS" +
      " INNER JOIN STUDENT ON STUDENT_ID IN(STUDENT.ACC_NO)" +
      " WHERE TUTOR_ID = ?"+
      " ORDER BY STATUS";
    db.query(qstring, [req.session.user.acc_no], (err, results) => {
      if(err) {
        res.json(err);
        return;
      }
      res.render('tutor/income', {
        transactions: results
      });
    })
  }
})

router.get('/viewappointmenthistory', (req, res) => {
  if(!req.session.user || req.session.user.type != ACCOUNT.TUTOR) {
    res.redirect('/');
  }
  else {
    db.query(`SELECT APPOINTMENTS.STATUS AS status, APPOINTMENTS.APPOINTMENT_ID, COURSES.COURSE_NAME AS COURSE, STUDENT.FNAME, STUDENT.LNAME FROM APPOINTMENTS LEFT JOIN STUDENT ON STUDENT.ACC_NO = APPOINTMENTS.STUDENT_ID LEFT JOIN COURSES ON APPOINTMENTS.COURSE = COURSES.COURSE_ID WHERE APPOINTMENTS.STATUS='FINISHED' OR APPOINTMENTS.STATUS = 'CANCELLED' GROUP BY APPOINTMENTS.APPOINTMENT_ID`, (err, results) => {
      if (err) {
        res.json(err); 
        return; 
      }      
      res.render('tutor/appointmenthistory', {
        apt: results
      })
    })
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

router.get('/coursesTutored', (req, res) => {
  if(!req.session.user || req.session.user.type != ACCOUNT.TUTOR) {
    return res.redirect('/');
  }
  const qstring =
    "SELECT * FROM COURSES"+
    " WHERE ACC_NO = ?";
  db.query(qstring, [req.session.user.acc_no], (err, results) => {
    res.render('tutor/coursestutored', {
      r: results
    })
  })
})


module.exports = router;