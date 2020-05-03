const express = require('express');
const router = express.Router();
const ACCOUNT = require('../../misc/accountTypes');
const db = require('../../db_files/db');
const {v4: uuid} = require('uuid');
const path = require('path');


// "/tutor/updateprofile"
router.post('/updateprofile', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.TUTOR) {
    res.redirect('/');
  } else {
    if(!req.body.fname || !req.body.lname || !req.body.email || !req.body.gender) {
      return res.status(400).sendFile(path.resolve('public/html/400.html'));
    }
    // * Check for email validness via a regex I 'borrowed' from StackOverflow
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)) {
      return res.redirect(`/tutor/editProfile?InvalidEmail=true`)
    }
    let data = {
      fname: req.body.fname,
      lname: req.body.lname,
      gender: req.body.gender,
      bio: req.body.bio,
      email: req.body.email,  
    }
    if(data.gender == 'none') data.gender = null;
    else {
      data.gender = data.gender == 'male' ? 'M' : 'F';
    }
    db.query(`select ACC_NO, EMAIL FROM TUTOR WHERE EMAIL = ?`, [req.body.email], (err, results) => {
      if(err) {
        return res.status(500).json(err);
      }
      if(results.length != 0 && results[0].ACC_NO !== req.session.user.acc_no) {
        return res.redirect('/tutor/editProfile?emailExists=true');
      }
      // Run the query and update
      db.query(`UPDATE TUTOR SET FNAME = ?, LNAME = ?, GENDER = ?, BIO = ?, EMAIL = ? WHERE ACC_NO = ?`, [data.fname, data.lname, data.gender, data.bio, data.email, req.session.user.acc_no], (err) => {
        if(err) {
          return res.status(500).json(err);
        }
        return res.redirect('/tutor/editProfile?updated=true')
      });
    })
  }
});

router.post('/sendMessage', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.TUTOR) {
    res.redirect('/');
  }
  if(req.query) {
    const msg = req.body.tutorMessage;
    const sid = req.query.sid;
    db.query(`insert into MESSAGES values(?, ?, ?, ?, ?, ?)`, [uuid(), req.session.user.acc_no, sid, msg, new Date().getTime()/1000, req.session.user.type], (err) => {
      if(err) {
        res.json(err);
        return;
      }
      res.redirect(`/tutor/messages?view=${sid}`)
    })
  }
});

router.post('/accept', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.TUTOR) {
    res.redirect('/');
  }
  if(req.query.aptid) {
    // If there is a query to accept the appointment given appointment ID (aptid)

    db.query(`select * from APPOINTMENTS where APPOINTMENT_ID = ?`, [req.query.aptid], (err, apt_details) => {
      if(err) {
        return res.json(err);
      }
      // If the appointment tutor ID isn't the same as the session account number ID,
      // someone is trying to spoof. In this case, send them a 400 page.
      if(apt_details[0].TUTOR_ID != req.session.user.acc_no) {
        return res.status(400).sendFile(path.resolve('public/html/400.html'));
      }

      // Update the appointments and set the status to true
      db.query(`UPDATE APPOINTMENTS SET STATUS = 'ACCEPTED' WHERE APPOINTMENT_ID = ? `, [req.query.aptid], (err) => {
        if(err) {
          res.status(500).json(err);
        }
        return res.redirect('/tutor/viewscheduledappointments');
      })

    })
  }
});

router.post('/reject', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.TUTOR) {
    res.redirect('/');
  }
  if(req.query.aptid) {
    db.query(`select * from APPOINTMENTS where APPOINTMENT_ID = ?`, [req.query.aptid], (err, apt_details) => {
      if(err) {
        res.json(err);
        return;
      }
      // If the appointment tutor ID isn't the same as the session account number ID,
      // someone is trying to spoof. In this case, send them a 400 page.
      if(apt_details[0].TUTOR_ID != req.session.user.acc_no) {
        res.status(400).sendFile(path.resolve('public/html/400.html'));
        return;
      }
    })
    db.query(`UPDATE APPOINTMENTS SET STATUS = 'REJECTED' WHERE APPOINTMENT_ID = ? `, [req.query.aptid], (err, results) => {
      if(err) throw err; 
      res.redirect(`/tutor/viewscheduledappointments?aptid=${req.query.aptid}&updated=true`);
    })
  }
});

router.post('/cancelAppointment', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.TUTOR) {
    res.redirect('/');
  }
  if(req.query.aptid) {
    db.query(`UPDATE APPOINTMENTS SET STATUS = 'CANCELLED' WHERE APPOINTMENT_ID = ? `, [req.query.aptid], (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.redirect('/tutor/viewscheduledappointments');
    })    
  }
});

router.post('/endAppointment', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.TUTOR) {
    res.redirect('/');
  }
    if(req.query.aptid) {
      db.query(`SELECT APPOINTMENT_ID FROM APPOINTMENTS WHERE APPOINTMENT_ID = ?`, [req.query.aptid], (err, results) => {
        if(err) {
          return res.status(500).json(err);
        }
        // If no results, return 404
        if(results.length == 0) {
          return res.status(404).sendFile(path.resolve('public/html/404.html'));
        }

        // Run another query to create a transaction with the amount
        const qstring = 
        "select"+
        " TUTOR_ID,"+
        " STUDENT_ID,"+
        " APPOINTMENT_DATE as ad,"+
        " APPOINTMENT_TIME as at,"+
        " C.INITIAL_SESSION_PRICE,"+
        " C.SESSION_HOURLY_PRICE"+
        " from APPOINTMENTS"+
        " INNER JOIN COURSES C ON APPOINTMENTS.COURSE IN(C.COURSE_ID)"+
        " where APPOINTMENT_ID = ?";

        db.query(qstring, [req.query.aptid], (err, results) => {
          if(err) {
            return res.status(500).json(err)
          }
          const apt = results[0];
          const nowEpoch = new Date().getTime()/1000/3600 - new Date(results[0].ad+" "+results[0].at).getTime()/1000/3600;
          const amount = apt.SESSION_HOURLY_PRICE*nowEpoch + apt.INITIAL_SESSION_PRICE;
          db.query(`insert into TRANSACTIONS values (?, ?, ?, ?, ?, ?, NULL)`, [uuid(), req.query.aptid, req.session.user.acc_no, apt.STUDENT_ID, 'NOT PAID', amount], (err) => {
            if(err) {
              return res.status(500).json(err);
            }
            // Update the appointment that was ended to 'FINISHED'
            db.query(`UPDATE APPOINTMENTS SET STATUS = 'FINISHED' WHERE APPOINTMENT_ID = ? `, [req.query.aptid], (err) => {
              if (err) throw err; 
              res.redirect(`/tutor/viewscheduledappointments`)
            })    
          })
        })

      })
    }
});

router.post('/removeCourse', (req, res) => {
  if(!req.session.user || req.session.user.type != ACCOUNT.TUTOR) {
    return res.redirect('/');
  }
  if(!req.query.cid) {
    return res.status(400).sendFile(path.resolve('public/html/400.html'));
  }
  const qstring = `SELECT * FROM COURSES WHERE ACC_NO = ?`;
  db.query(qstring, [req.session.user.acc_no], (err, results) => {
    if(err) {
      return res.status(500).json(err);
    }
    if(results.length == 0) {
      return res.status(404).sendFile(path.resolve('public/html/404.html'));
    }
    const qstring = `DELETE FROM COURSES WHERE ACC_NO = ? AND COURSE_ID = ?`;
    db.query(qstring, [req.session.user.acc_no, req.query.cid],(err) => {
      if(err) {
        return res.status(500).json(err);
      }
      return res.redirect('/tutor/coursestutored?courseDel=true');
    })
  })
})

router.post('/addCourse', (req, res) => {
  if(!req.session.user || req.session.user.type != ACCOUNT.TUTOR) {
    return res.redirect('/');
  }
  if(!req.body.coursename || !req.body.fixedprice || !req.body.hourlyrate) {
    return res.status(400).sendFile(path.resolve('public/html/400.html'));
  }
  const qstring = `INSERT INTO COURSES VALUES (?, ?, ?, ?, ?)`;
  db.query(qstring, [req.session.user.acc_no, uuid(), req.body.coursename, req.body.fixedprice, req.body.hourlyrate], (err) => {
    if(err) {
      return res.status(500).json(err);
    }
    res.redirect('/tutor/coursestutored?addCourse=true');
  })
})

module.exports = router;