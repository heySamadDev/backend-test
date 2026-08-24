const express = require("express");
const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productControllers.js");
const adminMiddleware = require("../middleware/adminMiddleware.js");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/:id", getProductById);
router.post("/", addProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", adminMiddleware, deleteProduct);

module.exports = router;
