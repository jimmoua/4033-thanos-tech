const express = require('express');
const router = express.Router();
const db = require('../db_files/db');
const bcrypt = require('bcrypt');
const ACCOUNT = require('../misc/accountTypes');
const path = require('path');

router.post('/:type', (req, res) => {
  if(!req.body.password || !req.body.email) {
    return res.status(400).sendFile(path.resolve('public/html/400.html'));
  }
  const pass = req.body.password;
  const email = req.body.email;
  switch(req.params.type) {
    case ACCOUNT.STUDENT: {
      db.query(`SELECT * FROM STUDENT WHERE EMAIL = ?;`, [email], (err, results) => {
        if(err) {
          return res.status(500).json(err);
        }
        if(results.length < 1) {
            res.status(401).redirect('/login?errType=student');
        }
        else {
          const hash = results[0].PASSWORD;
          bcrypt.compare(pass, hash, (err, result) => {
            if(err) {
              return res.status(500).json(err);
            }
            if(result) {
              req.session.user = {
                acc_no: results[0].ACC_NO,
                type: ACCOUNT.STUDENT
              }
              res.redirect('/');
            }
            else {
              res.status(401).redirect('/login?errType=student');
            }
          })
        }
      });
      break;
    }
    case ACCOUNT.PARENT: {
      db.query(`SELECT * FROM PARENT WHERE EMAIL = ?;`, [email], (err, results) => {
        if(err) {
          return res.status(500).json(err);
        }
        if(results.length < 1) {
          res.status(401).redirect('/login?errType=parent');
        }
        else {
          const hash = results[0].PASSWORD;
          bcrypt.compare(pass, hash, (err, result) => {
            if(err) {
              return res.status(500).json(err);
            }
            if(result) {
              req.session.user = {
                acc_no: results[0].ACC_NO,
                type: ACCOUNT.PARENT
              }
              res.redirect('/');
            }
            else {
              res.status(401).redirect('/login?errType=parent');
            }
          })
        }
      });
      break;
    }
    case ACCOUNT.TUTOR: {
      db.query(`select * from TUTOR where EMAIL = ?`, [email], (err, t_results) => {
        if(err) {
          return res.status(500).json(err);
        }
        if(t_results.length == 0) {
          return res.status(401).redirect('/login?errType=tutor');
        }
        else {
          const hash = t_results[0].PASSWORD;
          bcrypt.compare(pass, hash, (err, results) => {
            if(err) {
              return res.status(500).json(err);
            }
            if(results) {
              req.session.user = {
                acc_no: t_results[0].ACC_NO,
                type: ACCOUNT.TUTOR
              }
              res.redirect('/');
            }
            else {
              res.status(401).redirect('/login?errType=tutor');
            }
          })
        }
      })
      break;
    }
    default: {
      return res.status(400).sendFile(path.resolve('public/html/400.html'));
    }
  }
})

module.exports = router;