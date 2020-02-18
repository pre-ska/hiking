const mongoose = require('mongoose');
const slugify = require('slugify');

/******************************************** */
// schema i model

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'],
      unique: true,
      trim: true
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage: {
      type: Number,
      default: 4.5
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false // ovo je da nikada ne prikaze na klijentskoj strani ovo polje... za sakrit nesto
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    // 8-23 object for the options
    toJSON: { virtuals: true }, // if output is JSON add virtuals
    toObject: { virtuals: true } // if output is object...
  }
);

//8-23
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

/*
  4 middleware in mongoose:
  document, query, aggregate, model - 4 middleware in mongoose
*/
/////////////////////////////////////////////////////////////////

//************ DOCUMENT MIDDLEWARE: runs before .save() & .create() //8-24
tourSchema.pre('save', function(next) {
  //  mongoose isto ima next kao i express
  //console.log(this); // this se odnosi na dokument koji je trenutno u procesu/sejvanju
  this.slug = slugify(this.name, { lower: true });
  next();
});

//8-24
// tourSchema.post('save', function(doc, next) {
//   //  post-save middleware(hook) ima doc i next (poslije snimanja dokumenta)
// });

//************ QUERY MIDDLEWARE 8-25
// primjeni middleware na sve querije koji pocinju sa find
// .find(), .findOne()=findById()
tourSchema.pre(/^find/, function(next) {
  // u query middlewareu, THIS se odnosi na query a ne na dokument
  this.find({ secretTour: { $ne: true } }); //primjer: seacretTour ne prikazuj
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  //  post-save middleware(hook) ima doc i next (poslije snimanja dokumenta)
  console.log(`query took ${Date.now() - this.start} ms`);
  next();
});

//************ AGGREGATION MIDDLEWARE 8-26
tourSchema.pre('aggregate', function(next) {
  // THIS se odnosi na trenutni aggregation object
  console.log(this.pipeline());

  // izbaci seacretTour iz aggregationa, tako da u pipline dodaš novi match filter
  // pipleine je array, novi filter ubaci na prvo mjesto
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //seacretTour: false istp prolazi

  next();
});

/******************************************** */
const Tour = mongoose.model('Tour', tourSchema);
/******************************************** */

module.exports = Tour;
