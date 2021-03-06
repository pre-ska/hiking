//12-8 12-9

const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Booking = require("../models/bookingModel");
const Review = require("../models/reviewModel");

//14-10 za successp oruku nakon bookirane ture
exports.alerts = (req, res, next) => {
  const { alert } = req.query;

  //stavljam na local varijablu alert zato što je mogu čitati iz templatea...iz JS-a filea za njega
  if (alert === "booking") {
    res.locals.alert = "Your booking was successful! Please check your email.";
  }

  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // get all the tour data from collection
  const tours = await Tour.find();
  // console.log(tours[0].guides);
  res.status(200).render("overview", {
    title: "All tours",
    tours,
  });
});

//12-11
exports.getTour = catchAsync(async (req, res, next) => {
  // get the data for requested tour including reviews and guides
  // get the tour by slug
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) {
    return next(new AppError("There is no tour with that name", 404));
  }

  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});

//ext
exports.getSignupForm = (req, res, next) => {
  res.status(200).render("signup", {
    title: `Create new account`,
  });
};

//12-21
exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};

//12-15
exports.getLoginForm = (req, res, next) => {
  res.status(200).render("login", {
    title: `Log into your account`,
  });
};

//12-21
exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};

//13-18
exports.getMyTours = catchAsync(async (req, res, next) => {
  //prije sam za ovakvu funkcionalnost koristio "virtuals"
  //ovdje ću manualno napraviti na drugi način
  // 1) find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) find toursIDs with IDs from bookings
  const tourIDs = bookings.map((el) => el.tour);
  //- ovdje korsitim operator "in" jer tourIDs je array - bulk find
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  // - za render ne radim novi template već ću iskoristiti "overview"
  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
});

//ext
exports.getMyReviews = catchAsync(async (req, res, next) => {
  const user = req.user;
  // 1) find all reviews
  const reviews = await Review.find({ user: req.user.id });
  reviews.forEach((el) => (el.user = user));

  // // 2) find toursIDs with IDs from reviews
  // const tourIDs = reviewsArray.map((el) => el.tour);
  // //- ovdje korsitim operator "in" jer reviewsArray je array - bulk find
  // const tours = await Tour.find({ _id: { $in: tourIDs } });
  // // console.log(tours);

  // - za render ne radim novi template već ću iskoristiti "overview"
  res.status(200).render("reviews", {
    title: "My Reviews",
    reviews,
  });
});

//12-22
exports.updateUserData = catchAsync(async (req, res, next) => {
  //ovo je ruta iz form POST (za update account name, email)
  //ovo je više za test kako se može - kasnije ću raditi JS način
  //za ovo mi treba middleware express.urlencoded() u app.JS
  // jer kada forma napravi POST, ubaci u url podatke - pa moram ih dekodirati sa posbnim midlewareom
  const { email, name } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { email, name },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render("account", {
    title: "Your account",
    user: updatedUser,
  });
});
