function logRequest(req, res, next) {
  const log = `${new Date().toISOString()} - ${req.method} - ${req.url} - IP: ${req.ip}\n`;

  fs.appendFile(logFilePath, log, (err) => {
    if (err) {
      console.error("Failed to write log:", err.message);
      return next();
    }

    console.log(log.trim());
    next();
  });
}

module.exports = logRequest;
