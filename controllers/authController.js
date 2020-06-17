const { promisify } = require("util"); //10-9
const bcrypt = require("bcryptjs"); //10-15 ovo prima SAMO STRINGOVE
const crypto = require("crypto"); //10-14

//10-3
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken"); //10-6
const AppError = require("../utils/appError"); //10-7
const sendEmail = require("../utils/email"); //10-13

//10-7
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//10-15 kod koji se cesto ponavlja pa sam ga izvukao u zasebnu funkciju
// ovdje kreiram token i saljem ga sa user dokumentom prema klijentu
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  /******************************************* */
  //10-19
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true, // https - ovaj dio treba biti aktivan sam u produkciji
    httpOnly: true, //ovo kazecookie ne moze biti modificarn od strane browsera
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true; //HTTPS  koristim samo u produkcijskoj verziji a ne u developmentu

  res.cookie("jwt", token, cookieOptions);

  // da mi ne salje password prema klijentu, novo kreiran dokument sadrzi password iako sam stavio select: false u modelu...to je samo za save valid
  user.password = undefined;

  /******************************************* */
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

//10-6
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body); // ovo nije sigurno, jer se svako moze registrirati kao admin
  // const newUser = await User.create({
  //   // fragmentiram polja tako da je svako polje striktno defirnirano
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm,
  //   // passwordChangedAt: req.body.passwordChangedAt // ovo je samo za test
  // });

  //10-15 zamjena koda koji se ponavlja sa funkcijom
  createSendToken(newUser, 201, res);
  // const token = signToken(newUser._id);

  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser
  //   }
  // });
});

//10-7
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email and passwords exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // check if user exists && password is correct
  // select metoda doda jos i password u rezultat, jer originalno password nece doci... jer mu je select prop na false
  // ovdje moram imati i email i password...password dodje hashiran, kao sto je u DB
  const user = await User.findOne({ email: email }).select("+password");

  //svaki dokument (user) dobiven modelom (User) ima na sebi metodu koju sam mu napraviou u userModel.js --> correctPassword()
  // const correct = await user.correctPassword(password, user.password); PREBACIO DIREKTNO U IF STATEMENT JER PRETHODNA LINIJA MOZDA NECE VRATITI DOKUMENT...pa ce mi user.password biti undefined
  // prvi argument mi je password koji je poslao klijent kada se pokusava logirati
  // drugi argument mi je hashirani password iz DB kojeg sam dobio maloprije ...na liniji 43.. u dokumentu "user"
  // u modelu sam napravio metodu iz bcrypta koja ce ih automatski usporediti i vratit TRUE ili FALSE

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401)); // ako nema dokumenta (user) ili ako se passwordi ne podudaraju (correctPassword) -> throw error
  }

  //ako je sve dovde proslo, posalji token klijentu/useru

  //10-15 zamjena koda koji se ponavlja sa funkcijom
  createSendToken(user, 200, res);
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token
  // });
});

//12-19
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
};

//10-8 10-9 za svaku zasticenu rutu
exports.protect = catchAsync(async (req, res, next) => {
  // 1) provjeri dali ima token u requestu
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    //12-16 ako nema u headeru, provjeri dali postoji cookie sa jwt
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    ); // 401 - unauthorized
  }

  // 2) verifikacija tokena 10-9
  // u "decoded" dobijem id usera/dokumenta, kada je token izdan i kada mu je expired
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // -ako je verifikacija prosla -> nastavljam, ako nije, error ce biti throw i ovo se nece izvrsavati dalje

  // 3) provjeri dali korisnik jos uvijek postoji - zbog sigurnosti
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does not exists anymore",
        401
      )
    );
  }

  // 4) provjeri dali je korisnik promjenio password NAKON sto je JWT  token izdan
  // iat = "issued at"... to je u decoded objektu
  // changePasswordAfter je statc instance method u modelu...userModel.js
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed Password! Please log in again", 401)
    );
  }

  //ako je dovde dosao...sve je proslo ok GRANT ACCESS TO PROTECTED ROUTE
  // dodajem usera na req jer ce mi kasnije koristiti u .restrictTo() middlewareu
  req.user = currentUser;
  next();
});

//12-17 kopija protected (prethodnog) ovo je middleware za svaku rutu da provjeri dali je korisnik logiran ili ne
//ovo mi treba za rendering npr. navbara (user img, da sakrijem buttone za login, signup...)
exports.isLoggedIn = async (req, res, next) => {
  // u 12-19 maknio catchAsync i ubacio try/catch -
  //zato što logout metoda koja kreira bezvezni jwt token
  //izaziva globalnu grešku ovdje....
  //zato radim samo lokalni try/catch a ako je error -
  //puštam dalje jer user u biti nije logiran, i to je OK
  if (req.cookies.jwt) {
    try {
      //verify tokem from req.cookies
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // dohvati korisnika iz baze po IDju
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        // ako nema tog korsinika, prekini i  nastavi sa next() middleware tj. korisnik nije logiran
        // ovo je samo za rendering na frontendu - OVO NIJE SIGURNOSNI MEHANIZAM
        return next();
      }

      // 4) provjeri dali je korisnik promjenio password NAKON sto je JWT  token izdan
      // iat = "issued at"... to je u decoded objektu
      // changePasswordAfter je statc instance method u modelu...userModel.js
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      }

      //ako je dovde dosao...sve je proslo ok - USER JE LOGIRAN
      // moram dodati usera da bude dostupan za TEMPLATE - view engine
      // dodajem usera na response objekt, i template ce ga onda viditi kao varijablu "user"
      //svaki template ima pristup RES.LOCALS
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

//10-11...moram wrapati middleware u novu funkciju da primi argumente
// korsitim rest parametars syntax da primi sve argumente koliko ih god ima npr. ['admin','lead-guide']
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //defaultni role je "user" i nije sadrzan u argumentima "roles"...
    //kada sam dozvolio korisniku pristup u .protect() metodi, u req.user sam zapisao cijeli user objekt zajedno sa njegovom role
    //taj .protect() middleware uvijek ide prije .restrictTo()...zato imam u njemu role property
    //------------------------------------------------
    //ako role iz korsinickog objekta nije sadrzana u argumentima...odbacim zahtjev
    // console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      ); // 403- forbidden
    }

    //ako prodje dovde - OK - dozvolim brisanje
    next();
  };
};

//10-12 kreiranje tokena za reset passworda
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) dohvatim usera na osnovu emaila koji je dao u formi za reset password
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }

  // 2) generiram random token - za to cu korisititi staticku instance mtodu...jer su tokeni strikno vezani ka user podatke
  const resetToken = user.createPasswordResetToken();
  // nakon sto sam promjeni podatke u instance metodi, moram taj dokument snimiti...jer nigdje nije snimljen u DB
  // ALI...posto saljem samo email na ovu rutu... a spremanje podataka u DB zahtjeva validaciju, OVDJE MORAM IZRICITO NAGLASITI DA PRILIKOM SEJVANJA NE RADIM VALIDACIJU
  // btw ovo pripada mongoose libu
  await user.save({ validateBeforeSave: false });
  // res.status(200).json({
  //   status: 'success'
  // });

  // 3)10-13 posaljem token na tu email adresu
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and confirm password to: ${resetURL}\nIf you didn't forget your password, please ignor this email`;

  // 10-13 ovdje saljem email sa tokenom na adresu koja je u korisnickom dokumentu navedena prilikom registracije
  // ovdje se moze dogoditi greska...da mail nije poslan...i nije dovoljno samo poslati response da nesto ne valja vec moram ponistiti izdanei token
  // zato koristim try/catch
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    // 10-13 ovo  saljem na frontend kao obajvest da je poslan email na korisnicku email adresu
    // ovdje ne saljem token !!!!!!!!...token mora ici na email
    res.status(200).json({
      status: "success",
      message: "token send to email",
    });
  } catch (error) {
    //u slucaju greske ovdje moram ponistit token koji sam izdao
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    //spremin u DB ponistene tokene
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("there was an error sending the email.Try again later", 500)
    );
  }
});

//10-14 resetiranje passworda - kreiranje tokena
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) dohvati korisnika s obzirom na token
  // prvo hashiram token koji stigne u requestu kao param (:token) i onda trazim korisnika u DB po tom hashiranom tokenu
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // osim po tokenu, odma usporedim i dali je token istekao tj. dali je spremljeni Expires veci od trenutnog vremena... jos uvijek vazi
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) ako postoji taj korisnik i token NIJE istekao
  if (!user) {
    return next(new AppError("Token is invalid or expired.", 400)); //400 bad request
  }

  //ako prodje dovde,
  //onda na user dokument zapisem novi password i confirm password
  // ti passwordi nisu hashirani
  // resetiram token i njegov expire time
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  //spremim promjenjeni dokument
  // OVDJE CE VALIDATOR PROVJERITI DALI JE PASSWORD = CONFIRMPASSWORD
  // ZATIM CE OBRISATI CONFIRMPASSWORD
  // TO RADI PRE-HOOK - prije save()
  await user.save();

  // 3) obnovi passwordChangedAt property za tog korisnika
  user.passwordChangedAt = Date.now() - 1000;

  // 4) logiraj korisnika - posljai JWT token korisniku

  //10-15 zamjena koda koji se ponavlja sa funkcijom
  createSendToken(user, 200, res);
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token
  // });
});

//10-15 ako logiran korisnik hoce promjeniti password..
exports.updatePassword = catchAsync(async (req, res, next) => {
  //za provjeru mora unijeti trenutni password

  // 1) dohvati korsinika iz kolekcije
  // ovo radi logiran korsinik, a pomocu protected middlewarea vec imam user objekt u requestu
  // moram explicitno navesti polje password da mi vrati, jer incae password se ne salje u dokumentu koji se dohvati iz DB
  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }

  // 2) provjeri dali je POSTani password tocan sa instance metodom correctPassword()
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is incorrect", 401));
  }

  // 3) update the password - ako prodje dovde
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // validacija (usporedba password i passwordConfirm) ce biti automatski zbog toga sto je na userSchema stavljen validator
  // a PRE_HOOK ce hashirati password i obrisati passwordConfirm, jer radi prilikom svakog sejvanja dokumenta
  await user.save();

  // 4) logiraj korisnika sa novim passwordom

  //10-15 zamjena koda koji se ponavlja sa funkcijom
  createSendToken(user, 200, res);
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token
  // });
});
