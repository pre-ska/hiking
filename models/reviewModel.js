//11-8
const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // tura kojoj ovaj review pripada
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour", // kako povezati razlicite datasetove - cita Tour model - nemoram niti importirati tourModel dokument
      required: [true, "Review must belong to a tour"],
    },
    // ko je napisao ovaj review
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User", // kako povezati razlicite datasetove - cita User model - nemoram niti importirati userModel dokument
      required: [true, "Review must must have an author"],
    },
  },
  {
    //ako imam neko polje koje nije u DB a napravljeno je pomocu neke kalkulacije, zelim da bude u outputu
    toJSON: { virtuals: true }, // if output is JSON add virtuals
    toObject: { virtuals: true }, // if output is object...
  }
);

//11-24 prevent duplicate review - same tour, same user
//kombinacija ture i korisnika mora bit unique!!!!
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//11-10 query-pre-hook koji popuni "tour" i "user" sa dokumentima umjesto IDja...
// ovaj hook vrijedi za sve REVIEWS quierije koji pocinju sa "find"
reviewSchema.pre(/^find/, async function (next) {
  // U QUERY MIDDLEWAREU "THIS" SE UVIJEK ODNOSI NA TRENUTNI QUERY = PRETRAGU
  // this.populate({
  //   path: 'tour', // sta zelim da mi bude "populate" prilikom querija
  //   select: 'name' // koja polja ZELIM SAMO da mi ubaci u embeded objekt, sa (-) MINUS mogu izbaciti koje ne zelim
  // }).populate({
  //   path: 'user', // sta zelim da mi bude "populate" prilikom querija
  //   select: 'name photo' // koja polja ZELIM SAMO da mi ubaci u embeded objekt, sa (-) MINUS mogu izbaciti koje ne zelim
  // });

  // prije sam imao da mi polute radi i tour i user
  // maknio sam iz gornjeg koda da mi svaki review bude popunjen i sa turom...
  //lancanom reakcijom u svakom dohvacanju ture, dohvacam i review, pa onda opet za svaki review turu.... nepotrebno i zahtjevno
  this.populate({
    path: "user", // sta zelim da mi bude "populate" prilikom querija
    select: "name photo", // koja polja ZELIM SAMO da mi ubaci u embeded objekt, sa (-) MINUS mogu izbaciti koje ne zelim
  });

  next();
});

//11-22 statička metoda
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //u static method THIS se odnosi na model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//11-22 mogu koristiti post jer nakon sejvanja lako izračunam prosjek
reviewSchema.post("save", function () {
  // prvi THIS se odnosi na model
  // drugi THIS se odnosi na trenutni review dokument

  // ovo je statična metoda i moram je pozvati na modelu ali u ovo trnutku model još nije kreiran
  // zato ovo ide na istancu
  this.constructor.calcAverageRatings(this.tour);
});

//11-23 za "save" review mogu lako izracunati rating nakon što je dodan pomocu POST MIDDLEWARE
//ali za delete i update review nemogu jer  query je vec izvrsen...neznam za koju turu je updejtan review pa moram prvo sa PRE
// u pre nemogu izracunati jer imam prethodno stanje a ne novo koje ce tek nastupiti
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //THIS je trenutni querry
  this.r = await this.findOne();
  next();
});

//11-23 nastavak prethodnog PRE... trebao mi je tour ID kojeg ovdje ne mogu dobiti, query je izvršen već...mogu ga dobit isamo u query middewareu a to je PRE
//iz PRE middlewarea prenesem u POST middleware tourID i onda izračunam (stavio sam ga na this.r)
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

/******************************************** */
const Review = mongoose.model("Review", reviewSchema);
/******************************************** */

module.exports = Review;
