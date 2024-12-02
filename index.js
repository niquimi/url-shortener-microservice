require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// Body parsing middleware (before your route handling)
app.use(bodyParser.urlencoded({ extended: false }));  // Parse URL-encoded data (form data)
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let URLDatabase = {};

// Generate Short URL
function generateURL () {
  let URL;
  do {
    URL = Math.random().toString(36).substring(2, 8);
  } while (URLDatabase[URL]);
  return URL;
};

app.post('/api/shorturl', function(req, res) {
  const longUrl = req.body.url;

  const urlPattern = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/.*)?$/;

  if (!longUrl || !urlPattern.test(longUrl)) {
    return res.json({ error: 'invalid url' });
  }

  let shortUrl = generateURL();

  URLDatabase[shortUrl] = longUrl;

  res.json({
    original_url: longUrl,
    short_url: shortUrl
  });
});

app.get('/api/shorturl/:shortURL', function(req, res){
  let short = req.params.shortURL;

  let long = URLDatabase[short];
  if (!long) return res.status(404).json({ error: 'Short URL not found' });
  
  res.redirect(long);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
