//11-8
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review is required']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // tura kojoj ovaj review pripada
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour', // kako povezati razlicite datasetove - cita Tour model - nemoram niti importirati tourModel dokument
      required: [true, 'Review must belong to a tour']
    },
    // ko je napisao ovaj review
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // kako povezati razlicite datasetove - cita User model - nemoram niti importirati userModel dokument
      required: [true, 'Review must must have an author']
    }
  },
  {
    //ako imam neko polje koje nije u DB a napravljeno je pomocu neke kalkulacije, zelim da bude u outputu
    toJSON: { virtuals: true }, // if output is JSON add virtuals
    toObject: { virtuals: true } // if output is object...
  }
);

/******************************************** */
const Review = mongoose.model('Review', reviewSchema);
/******************************************** */

module.exports = Review;
