//11-9
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  /** 11-14 -------
   * provjerim dali u parametrima imam tour ID
   * ako ima onda ce to biti filter u "find()"
   * ako nema onda ce filter biti prazan objekt
   * i dohvatit ce sve reviewse kao i obicno */
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  /*******************************************************/

  const reviews = await Review.find(filter); // 11-14 dodao filter u query

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  /*************** blok iz 11-12  ALLOVED NESTED ROUTES********************** */
  // ako u req.body nije specifiran tour ID (doslovno nije ubacen manualno)
  // onda citam taj ID iz URLa ...iz parametra
  if (!req.body.tour) req.body.tour = req.params.tourId;
  //ista stvar i za user ID (autora reviewa)...ovaj ID onda citam iz prethodno ubacenog user objekta, to ubaci auth middleware u req.user
  if (!req.body.user) req.body.user = req.user.id;
  /****************************************************** */

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
