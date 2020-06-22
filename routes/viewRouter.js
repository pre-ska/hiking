//12-8 refactoring

const express = require("express");
const viewsController = require("../controllers/viewsController");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");

//kreiram router
const router = express.Router();

//12-17 ovo stavljam prije svih jer želim znati dali mi je korsinik logiran u frontendu ili ne
// ovo nije protected ruta...ovo je za sve rute za template da zna šta renderirati u navbaru
// 12-21 prebacio u rute !!!!!!!!!!!!!
// router.use(authController.isLoggedIn);

//12-03 render template --- ovo nema...sve ide na overview
// router.get("/", (req, res) => {
//   res.status(200).render("base", {
//     tour: "The Forest Hiker",
//     user: "Wolf",
//   });
// });

//12-7
router.get(
  "/",
  // bookingController.createBookingCheckout, // 13-17 privremeno riješenje za spremanje bookinga nakon transakcije
  authController.isLoggedIn,
  viewsController.getOverview
);

//12-11
router.get("/tour/:slug", authController.isLoggedIn, viewsController.getTour);

//12-15
router.get("/login", authController.isLoggedIn, viewsController.getLoginForm);

//ext
router.get("/signup", authController.isLoggedIn, viewsController.getSignupForm);

//12-21
router.get("/me", authController.protect, viewsController.getAccount);

//13-18
router.get(
  "/my-tours",
  // bookingController.createBookingCheckout,
  authController.protect,
  viewsController.getMyTours
);

//12-22
router.post(
  "/submit-user-data",
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
