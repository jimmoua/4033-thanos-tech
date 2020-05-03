const express = require('express');
const router = express.Router();
const db = require('../../db_files/db');
const ACCOUNT = require('../../misc/accountTypes');
const path = require('path');

router.post('/cancelappointment', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.PARENT) {
    res.redirect('/');
  }
  if(req.query.aptid) {
    const aptid = req.query.aptid;
    db.query(`delete from APPOINTMENTS where APPOINTMENT_ID = ?`, [aptid], (err) => {
      if(err) {
        res.json(err);
        return;
      }
      res.redirect('/parent/scheduledappointments');
    })
  }
})

router.post('/pay', (req, res) => {
  if(!req.session.user || req.session.user.type !== ACCOUNT.PARENT) {
    res.redirect('/');
    return;
  }
  if(req.query.tid) {
    const qstring = "SELECT ACC_NO, PARENT_ACC_NO FROM STUDENT " +
    "WHERE PARENT_ACC_NO = ? "; 
    db.query(qstring, [req.session.user.acc_no], (err, results) => {
      if (err) {
        res.json(err); 
        return; 
      }          
      if(req.session.user.acc_no != results[0].PARENT_ACC_NO) {
        res.status(400).sendFile(path.resolve('public/html/400.html'));
        return;
      }
      const qstring = 
      "UPDATE TRANSACTIONS SET " + 
      "STATUS = 'PAID', PAID_BY = ? " +
      "WHERE TRANSACTION_ID = ?";
      db.query(qstring, [req.session.user.acc_no, req.query.tid, req.session.user.acc_no], (err) => {
        if(err) {
          res.json(err);
          return;
        }  
        res.redirect(`/parent/managepayments?paid=true`);
      })

    })  
  }
})

router.post('/removechild', (req, res) => {
  if(!req.session.user  || req.session.user.type != ACCOUNT.PARENT) {
    console.log(req.session)
    res.redirect('/')
    return;
  }
  if(!req.query.childid) {
    res.status(404).sendFile(path.resolve('public/html/404.html'));
    return;
  }
  const cid = req.query.childid;
  const qstring = 
    "SELECT"+
      " ACC_NO,"+
      " PARENT_ACC_NO"+
      " FROM STUDENT"+
    " WHERE ACC_NO = ?"+
    " AND PARENT_ACC_NO = ?";
  db.query(qstring, [cid, req.session.user.acc_no], (err, results) => {
    if(err) {
      res.json(err);
      return;
    }
    // Check to see if the parent account is truly parent and no one
    // is trying to spoof/fiddle with data
    if(results.length == 0) {
      res.status(400).sendFile(path.resolve('public/html/400.html'));
      return;
    }
    // Update string
    const qstring = 
      "UPDATE STUDENT"+
      " SET PARENT_ACC_NO = NULL"+
      " WHERE ACC_NO = ?";
    db.query(qstring, [cid], (err) => {
      if(err) {
        res.json(err);
        return;
      }
      return res.redirect('/parent/seechildren?removed=true')
    })
  })
})

module.exports = router;