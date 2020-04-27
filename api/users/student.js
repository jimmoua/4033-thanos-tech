const express = require('express');
const router = express.Router();
const ACCOUNT = require('../../misc/accountTypes');
const db = require('../../db_files/db');

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
      console.log('the email is ', pemail)
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
    if (req.session.user.type != ACCOUNT.STUDENT) {
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
      searchTerm+='|'+course[i];
    }
    console.log(course);
    let q_string = `SELECT COURSES.COURSE_NAME, TUTOR.FNAME, TUTOR.LNAME, TUTOR.EMAIL, TUTOR.BIO FROM COURSES RIGHT OUTER JOIN TUTOR ON COURSES.ACC_NO = TUTOR.ACC_NO WHERE COURSES.COURSE_NAME REGEXP ?`;
    console.log(q_string);
    db.query(q_string, [searchTerm], (err, results) => {
      if(err) throw err;
      res.render('student/results', {
        course: results.length == 0 ? false : results
      });
    })
  }
})

module.exports = router;