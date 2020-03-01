//10-3
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken'); //10-6

exports.signup = catchAsync(async (req, res, next) => {
  //const newUser = await User.create(req.body);// 10-6 ovo nije sigurno, jer se svako moze registrirati kao admin
  const newUser = await User.create({
    //10-6 fragmentiram polja tako da je svako polje striktno defirnirano
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  //10-6
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});
