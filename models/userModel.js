//10-2
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
  passwordChangedAt: Date //10-9 zbog kontrole passworda dali je promjenjen
});

//10-4 hashing password bcrypt
userSchema.pre('save', async function(next) {
  // ako password nije modificiran, zovi next()... "this" je dokument
  if (!this.isModified('password')) return next();

  // hasiraj password sa "cost" 12
  this.password = await bcrypt.hash(this.password, 12); // 10 je default

  // obrisi passwordConfirm
  this.passwordConfirm = undefined; // nakon sto je password potvrdjen, vise ga ne trebam usporedjivati pa je i ovo polje u DB nepotrbno
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

/******************************************** */
const User = mongoose.model('User', userSchema);
/******************************************** */

module.exports = User;
