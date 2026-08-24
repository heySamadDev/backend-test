const express = require("express");
const {
  getOrders,
  getOrdersById,
  addOrders,
} = require("../controllers/orderControllers.js");

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrdersById);
router.post("/", addOrders);

module.exports = router;
