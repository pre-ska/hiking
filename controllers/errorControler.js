const AppError = require('../utils/appError');

// 9-10
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  // 9-9
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
// dijelim errore na development i production
const sendErrorProd = (err, res) => {
  // 9-9
  if (err.isOperational) {
    //trusted error, ide do klienta
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    //nepoznat error.... nesaljem ga klijentu vec samo na konzolu
    console.error('ERROR ----', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack); // stack trace pokaze direktno liniju gdje je pozvan error

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  //9-9
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    sendErrorProd(error, res);
  }
};
