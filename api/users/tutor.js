const express = require('express');
const router = express.Router();
const ACCOUNT = require('../../misc/accountTypes');
const db = require('../../db_files/db');


// "/tutor/updateprofile"
router.post('/updateprofile', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.TUTOR) {
    res.redirect('/');
  } else {
    let data = {
      fname: req.body.fname,
      lname: req.body.lname,
      gender: req.body.gender,
      bio: req.body.bio ? req.body.io : null,
      email: req.body.email,  
      course: req.body.courseAdd ? req.body.courseAdd : null
    }
    if(data.gender == 'none') data.gender = null;
    else {
      data.gender = data.gender == 'male' ? 'M' : 'F';
    }
    // Run the query and update
    db.query(`UPDATE TUTOR SET FNAME = ?, LNAME = ?, GENDER = ?, BIO = ?, EMAIL = ? WHERE ACC_NO = ?`, [data.fname, data.lname, data.gender, data.bio, data.email, req.session.user.acc_no], (err, results) => {
      if(data.courses) {
        db.query(`INSERT INTO COURSES VALUES (?, ?)`, [req.session.user.acc_no, data.course], (err, courseResults) => {
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

module.exports = router;