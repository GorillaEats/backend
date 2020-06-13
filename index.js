const express = require('express');

const logger = require('./src/logger');
const { errorHandler } = require('./src/api/middlewares');

const app = express();

const port = process.env.PORT || 8080;

app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Listening on Port ${port}`);
});
