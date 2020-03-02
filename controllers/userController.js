const User = require('../models/userModel'); // 10-7
const catchAsync = require('../utils/catchAsync'); //10-7

//10-7
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find(); //get all users

  // -- SEND RESPONSE!!!!!!!!!!!!!
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });

  // polje password nije ukljuceno u response jer se SELECT:false
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined'
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined'
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined'
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined'
  });
};
