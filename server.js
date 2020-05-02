// Requires
const express = require('express');
const session = require('express-session');
const path = require('path');
const morgan = require('morgan');
const CREDS = require('./misc/email');
const nodemailer = require('nodemailer');

// Create server called app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'foobar',
  resave: true,
  saveUninitialized: false,
  store: require('./db_files/sessionStore'),
  rolling: true,
  cookie:  {
    maxAge: 1000 * 60 * 30 // (1000 ms * 60 * 30 = 180k ms = 1800 seconds = 30min
  }
}))
app.use(morgan('dev'));

// Set static folder for public files
app.use(express.static(path.join(__dirname, 'public')));

// Set templating engine to EJS
app.set('view engine', 'ejs');

// Define our port
const port = process.env.PORT || 5000;

////////////////////////////////////////////////////////////////////////////////
//                               ROUTES
////////////////////////////////////////////////////////////////////////////////
app.use('/', require('./routes/'));

////////////////////////////////////////////////////////////////////////////////
//                              API ROUTES
////////////////////////////////////////////////////////////////////////////////
app.use('/api/', require('./api/'))

// ! DEBUG GET: type this in the URL bar to delete the current session
app.get('/rm-session', (req, res) => {
  req.session.destroy();
  res.redirect('/');
})

////////////////////////////////////////////////////////////////////////////////
//                              Nodemailer Sendmail
////////////////////////////////////////////////////////////////////////////////
app.post('/sendemail', async (req, res) => {
  console.log(req.body)
  if(!req.body.Name || !req.body.Email || !req.body.Message) {
    return res.status(400).sendFile(path.resolve('public/html/400.html'));
  }
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.Email)) {
    return res.status(400).send();
  }
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
      user: CREDS.email,
      pass: CREDS.pass
    }
  })
  let mailOptions = {
    from: `"${req.body.Email}" <${req.body.Email}>`,
    to: 'twt.trustworthytutor@gmail.com',
    text: `Sender email: ${req.body.Email} \nMessage from: ${req.body.Name} \nMessage: ${req.body.Message}`,
    subject: `Trustworthty Tutors - Contact Form (${req.body.Email} - ${req.body.Name})` 
  }
  transporter.sendMail(mailOptions, (err) => {
    if(err) {
      return res.status(500).send();
    }
    else {
      return res.status(200).send();
    }
  })
})

////////////////////////////////////////////////////////////////////////////////
//                              Route the 404
////////////////////////////////////////////////////////////////////////////////
app.use((req, res) => {
  res.sendFile(path.resolve('public/html/404.html'));
})

// Listen on port
app.listen(port, () => console.log(`Listening on port ${port}.`));
