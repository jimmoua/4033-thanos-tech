const express = require('express');
const router = express.Router();
const db = require('../db_files/db');
const ACCOUNT = require('../misc/accountTypes')

router.get('/:type/:action', (req, res) => {
  if(!req.session.user) {
    res.redirect('/');
  }
  else {
    const userType = req.params.type.toLowerCase();
    const userAction = req.params.action.toLowerCase();
    switch(userType) {
      //////////////////////////////////////////////////////////// 
      //               STUDENT HOMEPAGE GET
      //////////////////////////////////////////////////////////// 
      case ACCOUNT.STUDENT.toLowerCase(): {
        switch(userAction) {
          // set parent account
          case 'setparrentacc': {
            db.query(`select * from STUDENT where ACC_NO = '${req.session.user.acc_no}'`, (err, s_results) => {
              if(err) throw err;
              db.query(`select * from PARENT where ACC_NO = '${s_results[0].PARENT_ACC_NO}'`, (err, p_results) => {
                if(err) throw err;
                console.log(s_results[0].FNAME + " " + s_results[0].LNAME);
                res.render('student/setParentAcc', {
                  user: s_results[0].FNAME + " " + s_results[0].LNAME,
                  pemail: (p_results.legnth != 0 ? p_results[0].EMAIL : false)
                })
              })
            })
            break;
          }
          case 'editprofile': {
            db.query(`select * from STUDENT where ACC_NO = '${req.session.user.acc_no}'`, (err, results) => {
              if(err) throw err;
              res.render(`student/editProfile`, {
                name: results[0].FNAME + " " + results[0].LNAME,
                user: req.session.user
              })
            })
          }
          break;
        }
        break;
      }
      //////////////////////////////////////////////////////////// 
      //               TUTOR HOMEPAGE GET
      //////////////////////////////////////////////////////////// 
      case ACCOUNT.TUTOR.toLowerCase(): {
        break;
      }
      //////////////////////////////////////////////////////////// 
      //               PARENT HOMEPAGE GET
      //////////////////////////////////////////////////////////// 
      case ACCOUNT.PARENT.toLowerCase(): {
        break;
      }
    }
  }
})


module.exports = router;