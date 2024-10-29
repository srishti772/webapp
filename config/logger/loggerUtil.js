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
    url: `${method} ${originalUrl} ${userAgent}`,
    request: {
      body: body,
    },
    response: {
      status: statusCode,
      message: message,
    },


  };

  if (data !== null && data !== undefined) {
    logEntry.response.data = data; 
  }

  if (type === "info") {
    logger.info(logEntry);
  } else if (type === "error") {
    logger.error(logEntry);
  }
};

module.exports = logData;
