//12-8 12-9

const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");

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
