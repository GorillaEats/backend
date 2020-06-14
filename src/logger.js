const { createLogger, format, transports } = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');

const consoleOptions = {
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(/* istanbul ignore next */
      ({
        level, message, timestamp,
      }) => `${timestamp.replace('T', ' ')} ${level}: ${message}`,
    ),
  ),
};

const logger = createLogger({
  level: process.env.LOG_LEVEL,
  defaultMeta: { service: 'backend' },
  transports: [
    process.env.NODE_ENV === 'production'
      ? new LoggingWinston()
      : new transports.Console(consoleOptions),
  ],
});

module.exports = logger;
module.exports.stream = {
  // eslint-disable-next-line no-unused-vars
  write(message, exports) {
    logger.info(message.slice(0, -1));
  },
};
