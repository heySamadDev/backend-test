const products = require("../data/products.js");
const ApiResponse = require("../utils/apiResponse.js");

const getProducts = (req, res) => {
  return new ApiResponse(res, 200, null, products);
};

const getProductById = (req, res, next) => {
  const productId = Number(req.params.id);

  if (isNaN(productId)) {
    const err = new Error("Invalid product ID format");
    err.statusCode = 400;
    return next(err);
  }

  const product = products.find((p) => p.id === productId);

  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    return next(err);
  }

  return new ApiResponse(res, 200, null, product);
};

const addProduct = (req, res, next) => {
  const { name, price, stock } = req.body;

  if (name === undefined || price === undefined || stock === undefined) {
    const err = new Error("All fields are required");
    err.statusCode = 400;
    return next(err);
  }

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof price !== "number" ||
    price <= 0 ||
    typeof stock !== "number" ||
    stock < 0
  ) {
    const err = new Error("Invalid product data");
    err.statusCode = 400;
    return next(err);
  }

  const newId =
    products.length > 0
      ? Math.max(...products.map((product) => product.id)) + 1
      : 1;

  const newProduct = {
    id: newId,
    name: name.trim(),
    price,
    stock,
  };

  products.push(newProduct);

  return new ApiResponse(res, 201, "Product Added Successfully", newProduct);
};

const updateProduct = (req, res, next) => {
  const productId = Number(req.params.id);

  if (isNaN(productId)) {
    const err = new Error("Invalid product ID format");
    err.statusCode = 400;
    return next(err);
  }

  const product = products.find((p) => p.id === productId);

  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    return next(err);
  }

  const { name, price, stock } = req.body;
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof price !== "number" ||
    price <= 0 ||
    typeof stock !== "number" ||
    stock < 0
  ) {
    const err = new Error("Invalid product data");
    err.statusCode = 400;
    return next(err);
  }

  product.name = name.trim();
  product.price = price;
  product.stock = stock;

  return new ApiResponse(res, 200, "Product Updated Successfully", product);
};

const deleteProduct = (req, res, next) => {
  const productId = Number(req.params.id);

  if (isNaN(productId)) {
    const err = new Error("Invalid product ID format");
    err.statusCode = 400;
    return next(err);
  }

  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    return next(err);
  }

  products.splice(index, 1);

  return new ApiResponse(res, 200, "Product Deleted Successfully", null);
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
