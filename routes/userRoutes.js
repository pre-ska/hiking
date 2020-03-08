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
