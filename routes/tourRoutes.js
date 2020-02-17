const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

//6-18 definiram koji specificni param tražim ... NIJE VISE POTREBNO...za pravi db
// router.param('id', tourController.checkID);

// 8-19... posebna ruta (npr. top ponuda)...koristim middleware da bi dodao u query object sve potrebne fieldse...
//znaci u ovoj ruti dodajem defultne propse u req.query obj u aliasTopRoutes(), korisnik ih nece dodati sam odabirom, vec klikne na button a ja ih presretnem, popunim obj i onda nastavim dalje sa filtiranjem
router
  .route('/top-5-cheep')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/')
  .get(tourController.getAllTours)
  // .post(tourController.checkBody, tourController.createTour); nema vise checkBody
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
