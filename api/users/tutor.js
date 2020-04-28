const express = require('express');
const router = express.Router();
const ACCOUNT = require('../../misc/accountTypes');
const db = require('../../db_files/db');
const {v4: uuid} = require('uuid');


// "/tutor/updateprofile"
router.post('/updateprofile', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.TUTOR) {
    res.redirect('/');
  } else {
    let data = {
      fname: req.body.fname,
      lname: req.body.lname,
      gender: req.body.gender,
      bio: req.body.bio ? req.body.bio : null,
      email: req.body.email,  
      course: req.body.courseAdd ? req.body.courseAdd : null
    }
    if(data.gender == 'none') data.gender = null;
    else {
      data.gender = data.gender == 'male' ? 'M' : 'F';
    }
    // Run the query and update
    db.query(`UPDATE TUTOR SET FNAME = ?, LNAME = ?, GENDER = ?, BIO = ?, EMAIL = ? WHERE ACC_NO = ?`, [data.fname, data.lname, data.gender, data.bio, data.email, req.session.user.acc_no], (err, results) => {
      if(data.course) {
        db.query(`INSERT INTO COURSES VALUES (?, ?, ?)`, [req.session.user.acc_no, uuid(), data.course], (err, courseResults) => {
          if (err) throw err;
          res.redirect('/');
        })
      }
      else {
        res.redirect('/')
      }
    });
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
})

module.exports = router;