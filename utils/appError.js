//9-6
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // build in Error class prima samo message, ja saljem dodatno i statusCode po kojem kreiram error object
    // parent klasa doda message u objekt
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
