//10-1
const mongoose = require('mongoose');
const validator = require('validator');
import isEmail from 'validator/lib/isEmail';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    maxlength: [40, 'A user name must have less than 30 characters'],
    minlength: [10, 'A user name must have minimum 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [isEmail, 'Pleas provide valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true,
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    trim: true
  }
});

/******************************************** */
const User = mongoose.model('User', userSchema);
/******************************************** */

module.exports = User;
