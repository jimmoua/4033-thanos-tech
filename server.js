// Requires
const express = require('express');
const session = require('express-session');
const path = require('path');
const morgan = require('morgan');

// Create server called app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'foobar',
  resave: false,
  saveUninitialized: false,
  store: require('./db_files/sessionStore'),
  rolling: true,
  cookie:  {
    maxAge: 1000 * 60 * 10 // (1000 ms * 60 * 10 = 60k ms = 600 seconds = 10min
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

// Listen on port
app.listen(port, () => console.log(`Listening on port ${port}.`));
