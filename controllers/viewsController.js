//12-8 12-9

const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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