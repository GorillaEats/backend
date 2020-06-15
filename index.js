const express = require('express');
require('app-module-path').addPath(__dirname);

const setupDB = require('src/loaders/mongoose');
const logger = require('src/logger');
const { errorHandler, httpLogger } = require('src/api/middleware');

const app = express();

setupDB();

const PORT = process.env.PORT || 8080;

app.use(errorHandler);
app.use(httpLogger);

app.listen(PORT, () => {
  logger.info(`Listening on Port ${PORT}`);
});
