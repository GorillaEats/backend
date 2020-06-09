const { createLogger, format, transports } = require('winston');

const {
  colorize, combine, timestamp, printf, prettyPrint, align,
} = format;

const logger = createLogger({
  json: false,
  format: combine(
    colorize(),
    timestamp(),
    align(),
    prettyPrint(),
    printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [new transports.Console()],
  exitOnError: false, // do not exit on handled exceptions
});

module.exports = logger;
