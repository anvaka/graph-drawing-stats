var express = require('express');
var getLatestStats = require('./lib/stats');
var app = express();

// Convenience for allowing CORS on routes - GET only
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/githubstats/', function(req, res) {
  console.log('Checking stats');

  getLatestStats().then(function(stats) {
    res.json(stats);
  });
});

var port = process.env.PORT || 9999;

app.listen(port, null, function(err) {
  console.log('Github stats at your service: http://localhost:' + port);
});
