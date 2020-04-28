const express = require('express')
const router = express.Router();
const db = require('../db_files/db');
const ACCOUNT = require('../misc/accountTypes');

router.get('/search', (req, res) => {
  if (!req.session.user || req.session.user.type !== ACCOUNT.STUDENT) {
    res.redirect('/'); 
  }
  else {
    if(req.query.courses) {
      let course = req.query.courses.toString().toLowerCase().split('+')
      let searchTerm = course[0];
      searchTerm = searchTerm.replace(/[^a-z0-9+]+/gi, ' ');
      searchTerm = searchTerm.split(' ').filter(e => {
        return e !== ''
      });
      let queryTerm = searchTerm[0];
      for(var i = 1; i < searchTerm.length; i++) {
        queryTerm+='|'+searchTerm[i];
      }
      let q_string = `SELECT COURSES.COURSE_ID, COURSES.COURSE_NAME, TUTOR.FNAME, TUTOR.LNAME, TUTOR.EMAIL, TUTOR.BIO FROM COURSES RIGHT OUTER JOIN TUTOR ON COURSES.ACC_NO = TUTOR.ACC_NO WHERE COURSES.COURSE_NAME REGEXP ?`;
      db.query(q_string, [queryTerm], (err, results) => {
        if(err) throw err;
        res.render('student/results', {
          course: results.length == 0 ? false : results
        });
      })
      return;
    }
    res.render('student/search');
  }  
})

router.get('/scheduledappointments', (req, res) => {
  if (!req.session.user || req.session.user.type !== ACCOUNT.STUDENT) {
    res.redirect('/'); 
  }
  else {
    res.render('student/scheduledappointment')
  }
});

router.get('/managepayments', (req, res) => {
  if (!req.session.user || req.session.user.type !== ACCOUNT.STUDENT) {
    res.redirect('/'); 
  }
  else {
    res.render('student/managepayment')
  }
});

router.get('/appointmenthistory', (req, res) => {
  if (!req.session.user || req.session.user.type !== ACCOUNT.STUDENT) {
    res.redirect('/'); 
  }
  else {
    res.render('student/appointmenthistory')
  }
});

router.get('/editProfile', (req, res) => {
  if (!req.session.user || req.session.user.type !== ACCOUNT.STUDENT) {
    res.redirect('/'); 
  }
  else {
    db.query(`select FNAME, LNAME, BIO, GENDER, EMAIL from STUDENT EMAIL where ACC_NO = '${req.session.user.acc_no}'`, (err, results) => {
      if(err) throw err;
      res.render(`student/editProfile`, {
        name: ({fname: results[0].FNAME, lname: results[0].LNAME}),
        user: req.session.user,
        profile: results[0],
        email: results[0].EMAIL
      })
    })
  }
});

router.get('/setparrentacc', (req, res) => {
  if (!req.session.user || req.session.user.type !== ACCOUNT.STUDENT) {
    res.redirect('/'); 
  }
  else {
    db.query(`select * from STUDENT where ACC_NO = '${req.session.user.acc_no}'`, (err, s_results) => {
      if(err) throw err;
      db.query(`select * from PARENT where ACC_NO = '${s_results[0].PARENT_ACC_NO}'`, (err, p_results) => {
        if(err) throw err;
        res.render('student/setParentAcc', {
          user: s_results[0].FNAME + " " + s_results[0].LNAME,
          pemail: (p_results.length != 0 ? p_results[0].EMAIL : false)
        })
      })
    })
  }
})

router.get('/viewCourse', (req, res) => {
  if(!req.session.user || req.session.user.type != ACCOUNT.STUDENT || !req.query.courseid) {
    res.redirect('/');
  } else {
    const cid = req.query.courseid;
    db.query(`SELECT COURSES.COURSE_ID, COURSES.COURSE_NAME, TUTOR.FNAME, TUTOR.LNAME, TUTOR.EMAIL, TUTOR.BIO FROM COURSES RIGHT OUTER JOIN TUTOR ON COURSES.ACC_NO = TUTOR.ACC_NO WHERE COURSES.COURSE_ID = ?`, [cid], (err, results) => {
      if(err) throw err;
      if(results.length == 0) {
        res.status(404).send(`
        <center><h1>404 Not Found</h1></center>
        `)
      } else {
        res.render('student/courseview', {
          course: results[0]
        })
      }
    })
  }
})

module.exports = router;