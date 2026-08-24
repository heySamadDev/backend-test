const orders = require("../data/orders.js");
const products = require("../data/products.js");

const getOrders = (req, res) => {
  return res.status(200).json(orders);
};

const getOrdersById = (req, res, next) => {
  const { id } = req.params;

  const order = orders.find((o) => o.id === Number(id));
  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    return next(err);
  }

  return res.status(200).json(order);
};

const addOrders = (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    const err = new Error("ProductID and Quantity are required");
    err.statusCode = 400;
    return next(err);
  }

  const product = products.find((p) => p.id === Number(productId));
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    return next(err);
  }

  const newOrder = {
    id: orders.length > 0 ? orders[orders.length - 1].id + 1 : 1,
    product: product,
    quantity: Number(quantity),
  };

  orders.push(newOrder);

  return res.status(201).json({
    message: "Order placed successfully",
    order: newOrder,
  });
};

module.exports = {
  getOrders,
  getOrdersById,
  addOrders,
};
