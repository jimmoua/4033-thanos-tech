const express = require('express');
const router = express.Router();
const ACCOUNT = require('../../misc/accountTypes');
const db = require('../../db_files/db');

router.post('/setParentAccount', (req, res) => {
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
});

router.post('/updateProfile', (req, res) => {
  let data = {
    bio: req.body.bio,
    gender: req.body.gender,
    acc_no: req.session.user.acc_no,
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email
  }
  if(data.gender == 'none') data.gender = null;
  else {
    data.gender = data.gender == 'male' ? 'M' : 'F';
  }
  db.query(`Select EMAIL, ACC_NO from STUDENT where EMAIL = ?`, [data.email], (err, r) => {
    if(err) throw err;
    if(r.length >= 1 && req.session.user.acc_no !== r[0].ACC_NO) {
      res.status(400).redirect('/student/editProfile');
    }
    else {
      db.query(`update STUDENT set BIO = ?, GENDER = ?, FNAME = ?, LNAME = ?, EMAIL = ? where ACC_NO = ?`, [data.bio, data.gender, data.fname, data.lname, data.email, data.acc_no], (err, results) => {
        if(err) {
          throw err;
        }
        res.redirect('/');
      })
    }
  })
})

module.exports = router;