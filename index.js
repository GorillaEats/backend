const express = require('express');

const logger = require('./src/logger');

const app = express();

const port = process.env.PORT || 8080;

app.listen(port, () => {
  logger.info(`Listening on Port ${port}`);
});
