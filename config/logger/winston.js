const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => new Date().toISOString(),
    }),

    winston.format.printf(({ message }) => {
      return `${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "combined.log",
    }),

    new winston.transports.File({
      filename: "debug.log",
      level: "debug", 
    }),
  ],
});

module.exports = logger;
