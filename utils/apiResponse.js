class ApiResponse {
  constructor(res, status, message, data = null) {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  }
}

module.exports = ApiResponse;
