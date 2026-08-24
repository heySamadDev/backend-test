const processPayment = require("../services/paymentService.js");

const checkout = async (req, res, next) => {
  try {
    const { amount } = req.body;

    await processPayment(amount);

    res.status(200).json({
      success: true,
      message: "Payment successful",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
};
