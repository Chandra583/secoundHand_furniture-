class ApiError extends Error {
  constructor(message, statusCode = 400, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
  }
}

class ApiResponse {
  constructor(data, message = 'Success', statusCode = 200) {
    this.success = true;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
  }

  static success(data, message) {
    return new ApiResponse(data, message);
  }

  static error(message, statusCode = 400, errors = []) {
    return new ApiError(message, statusCode, errors);
  }

  send(res) {
    return res.status(this.statusCode).json(this);
  }
}

module.exports = {
  ApiError,
  ApiResponse,
}; 