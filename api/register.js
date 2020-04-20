const express = require('express');
const router = express.Router();


// POST Method for /api/registerStudent
router.post("/api/registerStudent", (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const classLevel = req.body.classLevel;
  const schoolName  =req.body.schoolName;
  const street = req.body.street;
  const city = req.body.city;
  const state = req.body.state;
  const phoneNum = req.body.phoneNum;
  const DOB = req.body.DOB;

  // TODO: send this data to a database
  res.send("Got it");
})

// POST method for /api/registerTutor
router.post("/api/registerTutor", (req, res) => {
  const firstName = req.body.firstName; 
  const lastName = req.body.lastName; 
  const email = req.body.email; 
  const classLevel = req.body.classLevel; 
  const schoolName = req.body.schoolName; 
  const street = req.body.street; 
  const city = req.body.city; 
  const state = req.body.state; 
  const phoneNum = req.body.phoneNum; 
  const DOB = req.body.DOB; 

  // To do: send this data to database
  res.send(`${firstName} ${lastName} registered as a tutor`); 
})

module.exports = router;