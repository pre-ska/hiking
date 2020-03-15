//11-9
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});

exports.updateReview = async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Radi se... ruta updateReview'
  });
};

exports.deleteReview = async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Radi se... ruta deleteReview'
  });
};
