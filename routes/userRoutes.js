const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//10-3
router.post('/signup', authController.signup);

//10-7
router.post('/login', authController.login);

//10-12
router.post('/forgotPassword', authController.forgotPassword);

//10-13
router.patch('/resetPassword/:token', authController.resetPassword);

//10-15 - mijenjam user document - zato patch
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

//10-16 - ruta za mijenjanje samo username i password
router.patch('/updateMe', authController.protect, userController.updateMe);

//10-17 - ruta za brisanje korisnika
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
