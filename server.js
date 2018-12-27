/*
    Happy holidays!
*/

const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const cors = require('cors');

if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler())
}
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());

const apiRouter = require('./api/api');
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log('Listening on port: ' + PORT);
  });
  
  module.exports = app;