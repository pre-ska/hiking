const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController'); //11-12
const reviewRouter = require('../routes/reviewRoutes'); //11-13

const router = express.Router();

/************ blok iz 11-12 i 11-13 ************************/
// //11-12 ruta za reviews - POST - treba korisnik biti autoriziran, restricted na user role
// // 11-13 OVO CU ZAMJENITI SA MOUNTANIM RUTEROM IZ REVIEWSA PA CU IMATI SVOJEVRSNI REDIRECT

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

//11-13 ovdje mountam reviewRouter tako da radim svojevrsni redirect na ovom URLu api/v1/tours/:tourId/reviews
// jer zelim da mi za sve reviews funkcije bude odgovoran reviewRouter
// router je u biti middleware i samo nastavim pipeline dalje u reviewRouter
router.use('/:tourId/reviews', reviewRouter);
/*************************************************************/

//6-18 definiram koji specificni param tražim ... NIJE VISE POTREBNO...za pravi db
// router.param('id', tourController.checkID);

// 8-19... posebna ruta (npr. top ponuda)...koristim middleware da bi dodao u query object sve potrebne fieldse...
//znaci u ovoj ruti dodajem defultne propse u req.query obj u aliasTopRoutes(), korisnik ih nece dodati sam odabirom, vec klikne na button a ja ih presretnem, popunim obj i onda nastavim dalje sa filtiranjem
router
  .route('/top-5-cheep')
  .get(tourController.aliasTopTours, tourController.getAllTours);

//8-21
router.route('/tour-stats').get(tourController.getTourStats);
//8-22
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours) //10-8
  // .post(tourController.checkBody, tourController.createTour); nema vise checkBody
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  ); //10-11

module.exports = router;
