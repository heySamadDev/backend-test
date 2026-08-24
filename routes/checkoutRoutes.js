const express = require("express");
const { checkout } = require("../controllers/checkoutControllers.js");

const router = express.Router();

router.post("/", checkout);

module.exports = router;
