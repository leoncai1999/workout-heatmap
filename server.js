const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

var proxy = require('express-http-proxy');

app.use(express.static(path.join(__dirname, 'build')));
app.use('/proxy', proxy('https://reverse.geocoder.ls.hereapi.com'));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT);