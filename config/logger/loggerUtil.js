const logger = require("./winston");

const logData = (
  method,
  originalUrl,
  userAgent,
  type,
  body,
  statusCode,
  message,
  data
) => {
  const logEntry = {
    request: {
      body: body,
    },
    response: {
      status: statusCode,
      message: message,
    }
  };

  if (data !== null && data !== undefined) {
    logEntry.response.data = data;
  }

  const logEntryFormatted = `[${type}] : [url: ${method} ${originalUrl} ${userAgent}] \n status: ${statusCode} \n message: ${message}`;

  if (type === "info") {
    logger.info(`${logEntryFormatted}`);
  } else if (type === "error") {
    logger.error(`${logEntryFormatted}`);
  }
};

module.exports = logData;
