const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); //10-20
const helmet = require('helmet'); //10-21
const mongoSanitize = require('express-mongo-sanitize'); //10-22
const xss = require('xss-clean'); //10-22
const hpp = require('hpp'); //10-23

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController'); //10-20
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//////////////////    GLOBAL MIDDLEWARES ////////////////////////////////////////////////////////

//development log
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/********************************************/

//10-21 ----- SET SECURITY HTTP HEADERS------ to je sve sto trebam za helmet--------------
app.use(helmet());

//10-20 rate limiter za sprecavanje visetrukih zahjeva  - DoS, bruteforce
const limiter = rateLimit({
  //ovdje definiram 100 requestova po satu maximalno
  max: 100, // maximalni broj requestova
  windowMs: 60 * 60 * 1000, // u milisekindama
  message: 'Too many request from this IP. Please try again in an hour' // poruka ako se prijedje limit
});

//10-20 naoravim middleware koji koristi limiter funkciju
// taj middleware se odnosi na sve requestove koji idu u poddomenu /api
app.use('/api', limiter);

/********************************************/
// body parser, reading data from the body into req.body
app.use(
  express.json({
    limit: '10kb' // limitiram body iz request da bude maximalno 10 kb velik
  })
);
/********************************************/

//10-22 data sanitization against NoSQL query injections
// ukloni $ i (.) iz requestova i parametar , tako da mongoDb operatori ne mogu raditi
app.use(mongoSanitize());
/********************************************/

//10-22 data sanitization against XSS atatcks - cross site scripting
// ukloni $bilo koji HTML kod iz korisnickog inputa
app.use(xss());
/********************************************/

//10-23 preventing parametar polution - duplicates in parametars - HPP lib
app.use(
  hpp({
    // niz dozvoljenih duplikata
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
/********************************************/

// serving static files...koristeći middleware
app.use(express.static(`${__dirname}/public`));
/********************************************/

//dodaje timestamp za svaki request - mozda mi ovo ne trba ?!?
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
/********************************************/

// ovo se zove mounting the routers 6-16
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//9-3 - u ovome trenutku sve rute su testirane i nema podudaranja, pa onda nastupa ovaj fallback
app.all('*', (req, res, next) => {
  //9-5  kreiram error, error handling middleware ce ga uhvatit
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // 9-5 ako next() ima argument, express zna da je to ERROR, prekida middleware pipline i salje taj error u error handling middleware
  //9-6
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// 9-4 ERROR HANDLING MIDDLEWARE - express ga prepozna jer ima 4 argumenta
app.use(globalErrorHandler); //9-6 refactoring

///////////////////////////////
module.exports = app;
