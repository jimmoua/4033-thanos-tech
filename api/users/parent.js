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
        res.status(402).sendFile(path.resolve('public/html/402.html'));
        return;
      }
      const qstring = 
      "UPDATE TRANSACTIONS SET " + 
      "STATUS = 'PAID', PAID_BY = ? " +
      "WHERE TRANSACTION_ID = ? AND STUDENT_ID = " +
      "(SELECT ACC_NO FROM STUDENT " +
      " WHERE PARENT_ACC_NO = ? ) ";
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

module.exports = router;