// Requires
const express = require('express');
const session = require('express-session');
const path = require('path');
const redis = require('redis');
const redisClient = redis.createClient();
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
    host: 'localhost',
    port: 6379,
    client: redisClient,
    ttl: 86400
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

// ! DEBUG GET: type this in the URL bar to delete the current session
app.get('/rm-session', (req, res) => {
  req.session.destroy();
  res.redirect('/');
})

// Listen on port
app.listen(port, () => console.log(`Listening on port ${port}.`));
