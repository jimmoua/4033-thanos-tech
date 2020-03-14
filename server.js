// Requires
const express = require('express');
const expressSession = require('express-session');
const path = require('path');

// Create server called app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set static folder for public files
app.use(express.static(path.join(__dirname, 'public')));

// Set templating engine to EJS
app.set('view engine', 'ejs');

// Define our port
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.render('index.ejs');
});

// Listen on port
app.listen(port, () => console.log(`Listening on port ${port}.`));
