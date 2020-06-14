//11-9
const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true }); //merge params je u 11-13

//11-19
router.use(authController.protect);

// GET mogu viditi svi
// POST mogu samo autorizirani korisnici i to samo user role
// 11-19 maknio authController.protect jer je u middlewareu
router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo("user"),
    reviewController.setTourAndUserIds,
    reviewController.createReview
  );

//11-15
//11-16 dodao patch
//11-17 dodao get
//11-19 dodao restrictTo() na patch i delete...samo autor reviewa i admin moze mjenjati i brisati review
router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview
  );

module.exports = router;
