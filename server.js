// Requires
const express = require('express');
const session = require('express-session');
const path = require('path');

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
}))

// Set static folder for public files
app.use(express.static(path.join(__dirname, 'public')));

// Set templating engine to EJS
app.set('view engine', 'ejs');

// Define our port
const port = process.env.PORT || 5000;

////////////////////////////////////////////////////////////////////////////////
//                               ROUTES
////////////////////////////////////////////////////////////////////////////////
app.get('/', require('./routes/home_views'));
app.get('/login', require('./routes/home_views'));
app.get('/register', require('./routes/home_views'));
app.get('/editProfile', require('./routes/home_views'));

////////////////////////////////////////////////////////////////////////////////
//                         ROUTES FOR TUTORS
////////////////////////////////////////////////////////////////////////////////
app.post('/api/registerTutor', require('./api/register')); 
app.post('/api/loginTutor', require('./api/register'));

////////////////////////////////////////////////////////////////////////////////
//                         ROUTES FOR STUDENTS
////////////////////////////////////////////////////////////////////////////////
app.post('/api/registerStudent', require('./api/register'));
app.post('/api/loginStudent', require('./api/login'));

////////////////////////////////////////////////////////////////////////////////
//                         ROUTES FOR PARENTS
////////////////////////////////////////////////////////////////////////////////
app.post('/api/loginParent', require('./api/login'))
app.post('/api/registerParent', require('./api/register'));

// ! DEBUG GET: type this in the URL bar to delete the current session
app.get('/rm-session', (req, res) => {
  req.session.destroy();
  res.redirect('/');
})

// Listen on port
app.listen(port, () => console.log(`Listening on port ${port}.`));
