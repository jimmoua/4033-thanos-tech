const express = require('express');
const router = express.Router();
const ACCOUNT = require('../../misc/accountTypes');
const db = require('../../db_files/db');
const {v4: uuid} = require('uuid')

router.post('/setParentAccount', (req, res) => {
  if (!req.session.user || req.session.user.type !== ACCOUNT.STUDENT) {
    res.redirect('/'); 
  }
  else {
    if(req.session.user.type != ACCOUNT.STUDENT) {
      res.status(400).send('Bad request.');
    }
    else {
      const pemail = req.body.pemail;
      db.query(`select ACC_NO from PARENT where EMAIL = '${pemail}';`, (err, p_results) => {
        if(p_results.length == 0) {
          res.send(`The parent email doesn't exist`);
        }
        else {
          db.query(`update STUDENT set PARENT_ACC_NO = '${p_results[0].ACC_NO}' where ACC_NO = '${req.session.user.acc_no}'`, (err, results) => {
            if(err) {
              res.send(`${err}`);
              throw err;
            }
            else {
              res.redirect('/');
            }
          })
        }
      })
    }
  }
});

router.post('/updateProfile', (req, res) => {
  if (!req.session.user || req.session.user.type !== ACCOUNT.STUDENT) {
    res.redirect('/'); 
  }
  else {
    let data = {
      bio: req.body.bio ? req.body.bio : null,
      gender: req.body.gender,
      acc_no: req.session.user.acc_no
    }
    if(data.gender == 'none') data.gender = null;
    else {
      data.gender = data.gender == 'male' ? 'M' : 'F';
    }
    db.query(`update STUDENT set BIO = ?, GENDER = ? where ACC_NO = ?`, [data.bio, data.gender, data.acc_no], (err, results) => {
      if(err) {
        throw err;
      }
      res.redirect('/');
    })
  }
})

router.post('/search', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.STUDENT) {
  } else {
    const course = req.body.course.toString().toLowerCase().trim(' ').split(' ').filter(e => {
      return e !== '';
    });
    let searchTerm = course[0];
    for(var i = 1; i < course.length; i++) {
      searchTerm+='+'+course[i];
    }
    res.redirect(`/student/search?courses=${searchTerm}`)
  }
})

router.post('/sendMessage', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.STUDENT) {
    res.redirect('/');
    return;
  }
  if(!req.query.cid) {
    res.status(500).send();
  } else {
    const cid = req.query.cid;
    if(!req.body.studentMessage) {
      res.status(400).send('<h1>400 Bad Request</h1>')
      return;
    }
    db.query(`SELECT TUTOR.ACC_NO, COURSES.COURSE_ID, COURSES.COURSE_NAME, TUTOR.FNAME, TUTOR.LNAME, TUTOR.EMAIL FROM COURSES RIGHT OUTER JOIN TUTOR ON COURSES.ACC_NO = TUTOR.ACC_NO WHERE COURSES.COURSE_ID = ?`, [cid], (err, results) => {
      db.query(`insert into MESSAGES values (?, ?, ?, ?, ?, ?)`, [uuid(), results[0].ACC_NO, req.session.user.acc_no, req.body.studentMessage, new Date().getTime()/1000, req.session.user.type], (err) => {
        if(err) {
          res.json(err)
          return;
        }
        res.redirect(`/student/viewCourse?courseid=${results[0].COURSE_ID}&messageSent=true`);
      })
    })
  }
})

router.post('/scheduleappointment', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.STUDENT) {
    res.redirect('/');
    return;
  }
  const data = {
    date: req.body.appointmentdate,
    time: req.body.appointmenttime,
    cid: req.query.cid,
  }
  db.query(`select ACC_NO from COURSES where COURSE_ID = ?`, [data.cid], (err, tutor) => {
    const acc_no = tutor[0].ACC_NO;
    db.query(`insert into APPOINTMENTS values (?, ?, ?, ?, ?, ?, ?)`, [uuid(), 'PENDING', data.cid, acc_no, req.session.user.acc_no, data.date, data.time], (err) => {
      if(err) {
        res.json(err);
        return;
      }
      res.redirect(`/student/viewCourse?courseid=${data.cid}&appReq=true`)
    })
  })
})

router.post('/cancelappointment', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.STUDENT) {
    res.redirect('/');
    return;
  }
  db.query(`delete from APPOINTMENTS where APPOINTMENT_ID = ?`, [req.query.aptid], (err) => {
    if(err) {
      res.json(err);
      return;
    }
    res.redirect('/student/scheduledappointments');
  })
})

module.exports = router;