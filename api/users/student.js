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

module.exports = router;