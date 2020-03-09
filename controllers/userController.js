const User = require('../models/userModel'); // 10-7
const catchAsync = require('../utils/catchAsync'); //10-7
const AppError = require('../utils/appError'); //10-16

//10-16 ova funkcija mi filtrira req. body i ostavi samo email i name prilikom upddejta
// da slucajno nebi bilo i nesto drugo npr. role: 'admin'...to bi bio sigurnosni propust
const filterObj = (obj, ...allowedFields) => {
  console.log(allowedFields);
  console.log(obj);
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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

//10-16 update user name, email od samog korisnika
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) ako korsinik pokusa updejtat password - POST password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update.Please use updateMyPassword',
        400
      )
    );
  }

  // 2) filter allowed fields - zbog sigurnosti
  // zelim striktno da mi updejta samo name i email.
  // to ova funkcija radi, ostavi samo polja u req. body koja sam ja definirao
  const filteredBody = filterObj(req.body, 'name', 'email');
  console.log(req.user.id);
  console.log(filteredBody);
  //3) update user document
  //...new: true u optionsima znaci da mi vrati updejtan objekt
  // runValidators: true korsitim zbog toga ako korsinik unese neisparavan email ili ime koje ima manje od 3 znaka...
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
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
