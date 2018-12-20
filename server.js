const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const morgan = require('morgan');

app.use(bodyParser.json());
app.use(errorhandler());
app.use(morgan('dev'));

const apiRouter = require('./api/api');
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log('Listening on port: ' + PORT);
  });
  
  module.exports = app;