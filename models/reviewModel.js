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

//11-10 query-pre-hook koji popuni "tour" i "user" sa dokumentima umjesto IDja...
// ovaj hook vrijedi za sve REVIEWS quierije koji pocinju sa "find"
reviewSchema.pre(/^find/, async function(next) {
  // U QUERY MIDDLEWAREU "THIS" SE UVIJEK ODNOSI NA TRENUTNI QUERY = PRETRAGU
  // this.populate({
  //   path: 'tour', // sta zelim da mi bude "populate" prilikom querija
  //   select: 'name' // koja polja ZELIM SAMO da mi ubaci u embeded objekt, sa (-) MINUS mogu izbaciti koje ne zelim
  // }).populate({
  //   path: 'user', // sta zelim da mi bude "populate" prilikom querija
  //   select: 'name photo' // koja polja ZELIM SAMO da mi ubaci u embeded objekt, sa (-) MINUS mogu izbaciti koje ne zelim
  // });

  // prije sam imao da mi polute radi i tour i user
  // maknio sam iz gornjeg koda da mi svaki review bude popunjen i sa turom... lancanom reakcijom u svakom dohvacanju ture, dohvacam i review, pa onda opet za svaki review turu.... nepotrebno i zahtjevno
  this.populate({
    path: 'user', // sta zelim da mi bude "populate" prilikom querija
    select: 'name photo' // koja polja ZELIM SAMO da mi ubaci u embeded objekt, sa (-) MINUS mogu izbaciti koje ne zelim
  });

  next();
});

/******************************************** */
const Review = mongoose.model('Review', reviewSchema);
/******************************************** */

module.exports = Review;
