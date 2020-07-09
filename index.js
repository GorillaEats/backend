const express = require('express');
const { errors } = require('celebrate');
require('app-module-path').addPath(__dirname);

const setupDB = require('src/loaders/mongoose');
const logger = require('src/logger');
const { queryParser, errorHandler, httpLogger } = require('src/api/middleware');
const { location } = require('src/api/routes');

const app = express();

setupDB();

const PORT = process.env.PORT || 8080;

// Middleware Pre Routes
app.set('query parser', queryParser);
app.use(httpLogger);

// Routes
app.use(location.PATH, location.router);

// Middleware Post Routes
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Listening on Port ${PORT}`);
});
