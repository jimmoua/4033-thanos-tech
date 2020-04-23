// Requires
const express = require('express');
const session = require('express-session');
const path = require('path');
const redis = require('redis');
const redisClient = redis.createClient(6379, '***REMOVED***tech-redis-001.kthw0e.0001.use2.cache.amazonaws.com', {
  no_ready_check: true
});
const redisStore = require('connect-redis')(session);

// Create server called app
const app = express();

redisClient.on('error', (err) => {
  console.log(`Redis Error: ${err}`);
})

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'foobar',
  resave: true,
  saveUninitialized: false,
  store: new redisStore({
    client: redisClient,
  }),
}))

// Set static folder for public files
app.use(express.static(path.join(__dirname, 'public')));

// Set templating engine to EJS
app.set('view engine', 'ejs');

// Define our port
const port = process.env.PORT || 5000;

app.get('/', require('./routes/home_views'));
app.get('/login', require('./routes/home_views'));
app.get('/register', require('./routes/home_views'));

// Route API
app.post('/api/registerStudent', require('./api/register'));
app.post('/api/registerTutor', require('./api/register')); 
app.post('/api/loginStudent', require('./api/login'));
app.post('/api/registerParent', require('./api/register'));

// ! DEBUG GET: type this in the URL bar to delete the current session
app.get('/rm-session', (req, res) => {
  req.session.destroy();
  res.redirect('/');
})

// Listen on port
app.listen(port, () => console.log(`Listening on port ${port}.`));
