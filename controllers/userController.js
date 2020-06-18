const multer = require("multer"); //13-3
const sharp = require("sharp"); //13-5
const User = require("../models/userModel"); // 10-7
const catchAsync = require("../utils/catchAsync"); //10-7
const AppError = require("../utils/appError"); //10-16
const factory = require("./handlerFactory"); //11-15

/////////////////////////////////////////////////////
// IMAGE UPLOAD
//13-3 ... 13-5 refactor donja funk - jer sada koristim sharp pa mi slika treba u bufferu biti
// const multerStorage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, "public/img/users");
//   },
//   filename: (req, file, callback) => {
//     //user-gfdsjk653kfdsg65-143254632522.jpeg
//     const ext = file.mimetype.split("/")[1];
//     callback(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

//13-5
const multerStorage = multer.memoryStorage();

//13-3 testiram vrstu filea...samo slike prolaze
const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(
      new AppError("Not an image. Please upload only images", 400),
      false
    );
  }
};

//13-3
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo"); //13-3

//13-5
exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};
//////////////////////////////////////////////////////////////////

//10-16 ova funkcija mi filtrira req. body i ostavi samo email i name prilikom upddejta
// da slucajno nebi bilo i nesto drugo npr. role: 'admin'...to bi bio sigurnosni propust
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

//11-17
exports.getAllUsers = factory.getAll(User);

// //10-7 , 11-17 factory funk
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find(); //get all users

//   // -- SEND RESPONSE!!!!!!!!!!!!!
//   res.status(200).json({
//     status: "success",
//     results: users.length,
//     data: {
//       users,
//     },
//   });

//   // polje password nije ukljuceno u response jer se SELECT:false
// });

//10-16 update user name, email od samog korisnika
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) ako korsinik pokusa updejtat password - POST password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password update.Please use updateMyPassword",
        400
      )
    );
  }

  // 2) filter allowed fields - zbog sigurnosti
  // zelim striktno da mi updejta samo name i email.
  // to ova funkcija radi, ostavi samo polja u req. body koja sam ja definirao
  const filteredBody = filterObj(req.body, "name", "email");

  //13-4 ako u requestu postoji file, dodaj ga na filtrirani BODY kao ime te slike...kasnije ću je snimit u DB
  if (req.file) filteredBody.photo = req.file.filename;

  //3) update user document
  //...new: true u optionsima znaci da mi vrati updejtan objekt
  // runValidators: true korsitim zbog toga ako korsinik unese neisparavan email ili ime koje ima manje od 3 znaka...
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

//10-17 - korisnik zeli obrisati svoj acc - stavljam njegov dokument na active: false
exports.deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    //204 deleted
    status: "success",
    data: null,
  });
};

//11-17
exports.getUser = factory.getOne(User);

//11-17 refactoring u factory
// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: "error",
//     message: "This route is not defined",
//   });
// };

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined!. Please use signup instead",
  });
};

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not defined'
//   });
// };

//11-16 pracio update u FF
//sa ovim se ne smije mjenjati password...
exports.updateUser = factory.updateOne(User);

//11-15 factory function za delete usera - totalni delete...ne samo updejte dali je aktivan ili ne
// samo admin ce moci kompletno obrisati korisnika...sam korisnik moze samo "deleteMe" sto u biti samo promjeni active status
exports.deleteUser = factory.deleteOne(User);

//11-18
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
