const AppError = require("../utils/appError");

// 9-10
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// 9-11
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  // console.log("duplikat", value);
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

// 9-12
const handleValidationErrorDB = (err) => {
  // svi pogresni unosi su u err.errors..to je objekt čiji properties su errori...
  // moram taj obj pretvoriti u array da loopam po njemu
  const errors = Object.values(err.errors).map((elem) => elem.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

//10-9 //////////////////////////////////
const handleJWTError = () =>
  new AppError("Invalid token. Pleas log in again", 401);
/////////////////////////////////////////////////////////

//10-9 //////////////////////////////////
const handleJWTExpiredError = () =>
  new AppError("Token expired. Pleas log in again", 401);
/////////////////////////////////////////////////////////

// dijelim errore na development i production
// 9-9
const sendErrorDev = (err, req, res) => {
  //12-20 ako error dolazi iz zahtjeva prema /api/ onda šaljem ovo
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // ako nije prema API onda trebam renderirati error na frontendu
  // i šaljjem error template i error message
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: err.message,
  });
};

// 9-9
const sendErrorProd = async (err, req, res) => {
  //12-20 isto kao i sendErrorDev gore
  //  API
  if (req.originalUrl.startsWith("/api")) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // B) Programming or other unknown error: don't leak error details
    //nepoznat error.... ne saljem ga klijentu vec samo na konzolu
    // 1) Log error
    console.error("ERROR #1 💥", err);
    // 2) Send generic message
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong #1",
    });
  }

  // RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.error("ERROR #2 💥", err);
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong! #2",
      msg: err.message,
    });
  }

  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error("ERROR #3 💥", err);
  // 2) Send generic message
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!#3",
    msg: "Please try again #4",
  });
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack); // stack trace pokaze direktno liniju gdje je pozvan error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  //9-9
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    //9-10 error prilikom pogresnog ID-ja u DB - mongoose error, mongoDB izbaci samo null ako nema taj id, hvatam ga na error.name
    if (error.name === "CastError") error = handleCastErrorDB(error);

    //9-11 error prilikom duplog unosa (npr ime koje je UNIQUE), to je mongoDB error i hvatam ga na error.code
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    //9-12 validation error - mongoose error, ako je ime manje od 10 karaktera, ako je difficulti razlicito od 3 moguća, ako rating nije od 0-5 vec npr 6... itd.
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);

    //10-9 JsonWebTokenError - invalid token
    if (error.name === "JsonWebTokenError") error = handleJWTError();

    //10-9 TokenExpiredError - expired token
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    // funkcija koja izbaci finalni error, prijasnje su samo dodavale detalje
    sendErrorProd(error, req, res);
  }
};
