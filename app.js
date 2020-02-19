const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControler');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

// serve static files...koristeći middleware
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log('hello from the middleware 🐱‍🐉');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

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
