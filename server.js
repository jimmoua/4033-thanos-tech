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
//                              AJAX CALL ROUTES
////////////////////////////////////////////////////////////////////////////////
app.use('/AJAX/', require('./AJAX/'));

////////////////////////////////////////////////////////////////////////////////
//                              Route the 404
////////////////////////////////////////////////////////////////////////////////
app.use((req, res) => {
  res.sendFile(path.resolve('public/html/404.html'));
})

// Listen on port
app.listen(port, () => console.log(`Listening on port ${port}.`));
