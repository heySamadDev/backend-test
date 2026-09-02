const processPayment = require("../services/paymentService.js");
const ApiResponse = require("../utils/apiResponse.js");

const checkout = async (req, res, next) => {
  try {
    const { amount } = req.body;

    await processPayment(amount);

    return new ApiResponse(res, 200, "Payment Successful", null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
};
