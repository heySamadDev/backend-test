const SECRET_KEY = "admin123";

const adminMiddleware = (req, res, next) => {
  try {
    const adminKey = req.headers["x-admin-key"];

    if (!adminKey) {
      const keyError = new Error("Access Denied: Missing x-admin-key");
      keyError.statusCode = 401;
      return next(keyError);
    }

    if (adminKey !== SECRET_KEY) {
      const keyError = new Error("Access Denied: Invalid x-admin-key");
      keyError.statusCode = 403;
      return next(keyError);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminMiddleware;
