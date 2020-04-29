CREATE TABLE `TRANSACTIONS` (
  `TRANSACTION_ID`  varchar(128)    NOT NULL,
  `TUTOR_ID`        varchar(128)    NOT NULL,
  `STUDENT_ID`      varchar(128)    NOT NULL,
  `STATUS`          char(10)        NOT NULL,
  `AMOUNT`          decimal(10,2)   NOT NULL,
  PRIMARY KEY                       (`TRANSACTION_ID`),
  KEY             `FKTUTOR`         (`TUTOR_ID`),
  KEY             `FKSTUDENT`       (`STUDENT_ID`),
  CONSTRAINT      `FKSTUDENT`       FOREIGN KEY (`STUDENT_ID`) REFERENCES `STUDENT` (`ACC_NO`),
  CONSTRAINT      `FKTUTOR`         FOREIGN KEY (`TUTOR_ID`) REFERENCES `TUTOR` (`ACC_NO`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1