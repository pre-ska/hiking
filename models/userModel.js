//10-2
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//10-12
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    maxlength: [40, 'A user name must have less than 30 characters'],
    minlength: [3, 'A user name must have minimum 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Pleas provide valid email']
  },
  photo: String,
  role: {
    // 10-11 implemntiram user roles za admine
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'], // vrste korsinika po ovlastima
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true,
    minlength: 8,
    select: false //ne prikazuje se nigdje...npr u odgovoru RESPONSE prema klijentu
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    trim: true,
    validate: {
      //10-4 usporedi 2 polja, radi samo na CREATE i SAVE!! (a ne npr findOneAndUpdate)
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same'
    }
  },
  passwordChangedAt: Date, //10-9 zbog kontrole passworda dali je promjenjen
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    // dali je korisniko racun aktivan ili ne
    type: Boolean,
    default: true,
    select: false // ovo znaci da ovaj prop ACTIVE nece biti dostupan klijentskoj strani na uvid kada vratim user dokument, zivi samo u DB
  }
});

//10-4 hashing password bcrypt - PRE-HOOK
userSchema.pre('save', async function(next) {
  // ako password nije modificiran, zovi next()... "this" je dokument
  if (!this.isModified('password')) return next();

  // hasiraj password sa "cost" 12
  this.password = await bcrypt.hash(this.password, 12); // 10 je default

  // obrisi passwordConfirm
  this.passwordConfirm = undefined; // nakon sto je password potvrdjen, vise ga ne trebam usporedjivati pa je i ovo polje u DB nepotrbno
  next();
});

//10-14 pre-hook za provjeru promjene passworda prilikom snimanja
// ako priolikom snimanja dokumenta password NIJE promjenjen ili AKO JE OVO NOVI dokument (koji isto zapise password)
// return next() --- jednostavno iskoci iz fumnkcije
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  // a ako prodje, onda zapisi novi property passwordChangedAt u user dokument
  this.passwordChangedAt = Date.now();

  next();
});

// https://mongoosejs.com/docs/middleware.html  --- TIPOVI MIDDLEWAREA
//10-17 pre-hook - QUERY MIDDLEWARE - za provjeru dali je korsinik ACTIVE ili ne (tj obrisan)
// query je FIND
// korsitim regular expression tako da mi sve sto pocinje sa find koristi ovaj middleware
// find, findById...
userSchema.pre(/^find/, function(next) {
  // THIS = current query - trenutna pretraga koja ce se nadopuniti
  // znaci prije rezultata svake pretrage ovaj middleware jos dodatno filtrira po ACTIVE
  this.find({ active: { $ne: false } }); //not equal to false - jer ako stavim samo active: true...onda dokumenti koji nemau uopce polje active nece biti dohvaceni

  next();
});

//10-7 static instance method - ovo ce biti dostupno na svim dokumentima neke kolekcije...znaci mogu ovu metodu pozvati na bilo kojem USer modelu u npr authControleru
//hasira password prilikom logina...onda taj hash usporedjujem sa hashom u DB...
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//10-9 static instance method - ovo ce biti dostupno na svim dokumentima neke kolekcije...znaci mogu ovu metodu pozvati na bilo kojem Ueer dokumentu u npr authControleru
//ova metoda provjerava dali je promjenjen password od korisnika u vremenu od kada je izdan token -JWTTimestamp
userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
  //this je trenutni dokument
  // ako je korisnik promjenio password, nesto ce biti zapisano - timestamp...ako nije, nece postojati
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp; //false je OK...nije promjenjen u medjuvremenu
  }

  //false means NOT changed
  return false;
};

//10-12 static instance method - ovo ce biti dostupno na svim dokumentima neke kolekcije...znaci mogu ovu metodu pozvati na bilo kojem Ueer dokumentu u npr authControleru
//ova metoda ce kreirati random token ako korisnik zeli da promjeni password
userSchema.methods.createPasswordResetToken = function() {
  // build in node module - crypto kreira token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // - NIKAD NE SPREMAM U DB CISTI TOKEN...vec ga hashiram sa crypto metodom createHash
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

/******************************************** */
const User = mongoose.model('User', userSchema);
/******************************************** */

module.exports = User;
