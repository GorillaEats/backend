const morgan = require('morgan');
const logger = require('../../logger');
require('../../logger');

module.exports = morgan(':method :url :status :response-time ms', { stream: logger.stream });
