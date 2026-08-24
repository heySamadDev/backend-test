const express = require("express");
const productRoutes = require("./routes/productRoutes.js");
const fs = require("fs");
const path = require("path");

const app = express();

const logDir = path.join(__dirname, "Data");
const logFilePath = path.join(logDir, "server.log");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, "");
}

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

app.use(express.json());
app.use(logRequest);

app.use("/products", productRoutes);

app.use((err, req, res, next) => {
  console.error("Error Trace:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  return res.status(statusCode).json({
    message: message,
  });
});

app.listen(3000, () => {
  console.log("Server is running on PORT: 3000");
});
