//10-3
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken'); //10-6
const AppError = require('../utils/appError'); //10-7

//10-7
const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

//10-6
exports.signup = catchAsync(async (req, res, next) => {
  //const newUser = await User.create(req.body);// ovo nije sigurno, jer se svako moze registrirati kao admin
  const newUser = await User.create({
    // fragmentiram polja tako da je svako polje striktno defirnirano
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

//10-7
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email and passwords exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // check if user exists && password is correct
  // select metoda doda jos i password u rezultat, jer originalno password nece doci... jer mu je select prop na false
  // ovdje moram imati i email i password...password dodje hashiran, kao sto je u DB
  const user = await User.findOne({ email: email }).select('+password');

  //svaki dokument (user) dobiven modelom (User) ima na sebi metodu koju sam mu napraviou u userModel.js --> correctPassword()
  // const correct = await user.correctPassword(password, user.password); PREBACIO DIREKTNO U IF STATEMENT JER PRETHODNA LINIJA MOZDA NECE VRATITI DOKUMENT...pa ce mi user.password biti undefined
  // prvi argument mi je password koji je poslao klijent kada se pokusava logirati
  // drugi argument mi je hashirani password iz DB kojeg sam dobio maloprije ...na liniji 43.. u dokumentu "user"
  // u modelu sam napravio metodu iz bcrypta koja ce ih automatski usporediti i vratit TRUE ili FALSE

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401)); // ako nema dokumenta (user) ili ako se passwordi ne podudaraju (correctPassword) -> throw error
  }

  //ako je sve dovde proslo, posalji token klijentu/useru
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

//10-8
exports.protect = catchAsync(async (req, res, next) => {
  // 1) provjeri dali ima token u requestu
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    ); // 401 - unauthorized
  }

  // 2) verifikacija tokena

  // 3) provjeri dali korisnik jos uvijek postoji

  // 4) provjeri dali je korisnik promjenio password NAKON sto je JWT  token izdan

  next();
});
