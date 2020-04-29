const express = require('express');
const router = express.Router();
const db = require('../../db_files/db');
const ACCOUNT = require('../../misc/accountTypes');

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

module.exports = router;