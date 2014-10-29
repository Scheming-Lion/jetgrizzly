var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var ip = process.env.IP  || undefined;

// serve static files from client. This file is copied to dist in production.
var job = require('./database/database.js');

// enables the views of the application to use straight HTML files.
// essentially we are using ejs as the template for our server's views
// but not really using ejs in the files at all.
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// tells the application where to go to find the views so that they can
// be rendered.
app.set('views', __dirname + '/app');

app.use(express.static(__dirname));

app.get('/', function(request, response) {
  job.checkCurrentVideo();
  response.render('index');
});

var server = require('http').createServer(app);
// start server
server.listen(port, ip, function () {
  console.log('Express server listening on %d!', port);
});

// expose app
exports = module.exports = app;
