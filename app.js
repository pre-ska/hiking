const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit"); //10-20
const helmet = require("helmet"); //10-21
const mongoSanitize = require("express-mongo-sanitize"); //10-22
const xss = require("xss-clean"); //10-22
const hpp = require("hpp"); //10-23
const cookieParser = require("cookie-parser"); //12-16
const compression = require("compression"); //14-5
const cors = require("cors"); //14-10

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController"); //10-20
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const bookingController = require("./controllers/bookingController");
const viewRouter = require("./routes/viewRouter");

const app = express();

//14-7 zbog herouku, heroku trži secure headere (authController.js line 32)
app.enable("trust proxy");

//12-03
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//////////////////    GLOBAL MIDDLEWARES ////////////////////////////////////////////////////////
//14-10
app.use(cors()); // doda headere da server može odgovoriti za requestove od svih domena
// ali ovo  radi samo za "simple requests" GET  i POST
/* ako želim samo na pojedinoj domeni koristiti CORS - dozvoliti
 app.use(cors{ origin: 'https://www.nekadomena.com})
 */

// non-simple requests (PUT,PATCH,DELETE, req sa cookies) zahtjeva pre-flight phase
app.options("*", cors()); // na pre-flight moram odgovoriti sa options
// app.options('/api/v1/tours/:id', cors()) // primjer za samo jednu rutu, samo sa nje se može poslati zahtjev PATCH,DELETE... sa drugog origina
////////////////////////////////////////

// serving static files...koristeći middleware
app.use(express.static(path.join(__dirname, "/public")));
//development log
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/********************************************/

//10-21 ----- SET SECURITY HTTP HEADERS------ to je sve sto trebam za helmet--------------
app.use(helmet());

//10-20 rate limiter za sprecavanje visetrukih zahjeva  - DoS, bruteforce
const limiter = rateLimit({
  //ovdje definiram 100 requestova po satu maximalno
  max: 100, // maximalni broj requestova
  windowMs: 60 * 60 * 1000, // u milisekindama
  message: "Too many request from this IP. Please try again in an hour", // poruka ako se prijedje limit
});

//10-20 naoravim middleware koji koristi limiter funkciju
// taj middleware se odnosi na sve requestove koji idu u poddomenu /api
app.use("/api", limiter);

//14-10 ovo moram ovako a ne preko ubačiajenog postupa (router -> controller)
// jer stripe doda nove stvari na body a u daljnjem kodu parseri pretvore body u JSON...tako da moram uhvatit te headere prije nego ih parseri sjebu
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }), // ovo parsira posebno body za STRIPE
  bookingController.webhookCheckout
);

/********************************************************
 ********************************************************
 ********************************************************
 ********************************************************
 ********************************************************
 ********************************************************/

// body parser, reading data from the body into req.body
app.use(
  express.json({
    limit: "10kb", // limitiram body iz request da bude maximalno 10 kb velik
  })
);
/********************************************/

//12-22 parser za npr. url encoded form - kada radim diretno post iz forme
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//12-16 parser koji čita data iz cookie-ja
app.use(cookieParser());

//10-22 data sanitization against NoSQL query injections
// ukloni $ i (.) iz requestova i parametar , tako da mongoDb operatori ne mogu raditi
app.use(mongoSanitize());
/********************************************/

//10-22 data sanitization against XSS atatcks - cross site scripting
// ukloni bilo koji HTML kod iz korisnickog inputa
app.use(xss());
/********************************************/

//10-23 preventing parametar polution - duplicates in parametars - HPP lib
app.use(
  hpp({
    // niz dozvoljenih duplikata
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

/******  14-5 **************************************/
app.use(compression());
/********************************************/

//dodaje timestamp za svaki request - ovo je samo testiranje middlewarea
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log("cookies app.js", req.cookies); //12-16
  next();
});

/********************************************/
// ROUTES
// ovo se zove mounting the routers 6-16
app.use("/", viewRouter); //12-8
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter); //11-9
app.use("/api/v1/bookings", bookingRouter); //11-9

//9-3 - u ovome trenutku sve rute su testirane i nema podudaranja, pa onda nastupa ovaj fallback
app.all("*", (req, res, next) => {
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
