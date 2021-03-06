CREATE TABLE `COURSES` (
  `ACC_NO` varchar(128) NOT NULL,
  `COURSE_ID` varchar(128) NOT NULL,
  `COURSE_NAME` varchar(128) NOT NULL,
  `INITIAL_SESSION_PRICE` decimal(10,2) NOT NULL,
  `SESSION_HOURLY_PRICE` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ACC_NO`,`COURSE_ID`),
  CONSTRAINT `FK` FOREIGN KEY (`ACC_NO`) REFERENCES `TUTOR` (`ACC_NO`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1