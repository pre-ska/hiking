//13-14
const express = require("express");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

const router = express.Router();

//13-19 za prvu rutu trebam imati samo logiranog korisnika
router.use(authController.protect);

router.get(
  "/checkout-session/:tourId",
  // authController.protect,
  bookingController.getCheckoutSession
);

/*********************** 13-19 ***************************/
//za sve ostale rute moram imati admina ili lead-guide
router.use(authController.restrictTo("admin", "lead-guide"));

router
  .route("/")
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route("/:id")
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

/********************************************************/

module.exports = router;
