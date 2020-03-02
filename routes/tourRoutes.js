const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

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
  .delete(tourController.deleteTour);

module.exports = router;
