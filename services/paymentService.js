const processPayment = (amount) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (amount <= 50000) {
        resolve();
      } else {
        reject(new Error("Payment failed"));
      }
    }, 2000);
  });
};

module.exports = processPayment;
