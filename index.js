const express = require('express');

const logger = require('./src/logger.js');

const app = express();
const { NODE_PORT } = process.env;

app.listen(NODE_PORT, () => {
  logger.info(`Server listening on port: ${NODE_PORT}`);
});
