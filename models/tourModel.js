const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const User = require('./userModel');//11-4

/******************************************** */
// schema i model

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less than 40 characters'],
      minlength: [10, 'A tour name must have minimum 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain charaters']
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
      required: [true, 'A tour must have a difficulty'],
      enum: {
        //8-27
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be equal or below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      //8-28 custom validators
      type: Number,
      validate: {
        validator: function(val) {
          //THIS se odnosi na trenutni  dokument SAMO KADA KREIRAM NOVI dokument
          return val < this.price;
        },
        message: 'Discount {{VALUE}} is not valid'
      }
    },
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
      // ovo je schemaType options objekt
      type: Boolean,
      default: false
    },
    startLocation: {
      //11-4 GeoJSON - ovo je doslovno embeded object - ne schemaType options
      type: {
        //ovo je schemaType options
        type: String,
        default: 'Point', // zelim da po defaultu bude point - tocka
        enum: ['Point'] // zeli da samo i prima point kao tip i nista vise
      },
      coordinates: [Number], // prima niz brojeva
      address: String,
      description: String
    },
    //11-4
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // child references by ID 11-6
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User' // kako povezati razlicite datasetove - cita User model - nemoram niti importirati User dokument
      }
    ]
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

//11-11 ovo je "virtual populate" - ne zelim direktno cuvati sve IDjeve od child reviews u tour dokumentu
// https://mongoosejs.com/docs/tutorials/virtuals.html#populate
tourSchema.virtual('reviews', {
  ref: 'Review', // na koji model se referenciram
  foreignField: 'tour', // koje polje u referentom modelu zamjenjujem
  localField: '_id' // polje po kojem vezem lokalni model sa foreign modelom
});

/*!!!! 4 MIDDLEWARE IN MONGOOSE: document, query, aggregate, model !!!!*/
/////////////////////////////////////////////////////////////////

//************ DOCUMENT MIDDLEWARE: runs before .save() & .create()
//8-24
tourSchema.pre('save', function(next) {
  //  mongoose isto ima next kao i express
  //console.log(this); // this se odnosi na dokument koji je trenutno u procesu/sejvanju
  this.slug = slugify(this.name, { lower: true });
  next();
});

// //11-4 pre-hook za embedanje user dokumenata u tour dokument (vodica) - NE KORISTIM OVO ...SAMO ZA PRIMJER
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//8-24
// tourSchema.post('save', function(doc, next) {
//   //  post-save middleware(hook) ima doc i next (poslije snimanja dokumenta)
// });

//************************************/
//************ QUERY MIDDLEWARE 8-25
// primjeni middleware na sve querije koji pocinju sa find
// .find(), .findOne()=findById()
tourSchema.pre(/^find/, function(next) {
  // u query middlewareu, THIS se odnosi na query a ne na dokument
  this.find({ secretTour: { $ne: true } }); //primjer: seacretTour ne prikazuj
  this.start = Date.now();
  next();
});

//11-7 query-pre-hook koji popuni "guides" niz sa dokumentima umjesto IDja...
// ovaj hook vrijedi za sve tours quierije koji pocinju sa "find"
tourSchema.pre(/^find/, async function(next) {
  // U QUERY MIDDLEWAREU "THIS" SE UVIJEK ODNOSI NA TRENUTNI QUERY = PRETRAGU
  this.populate({
    path: 'guides', // sta zelim da mi bude "populate" prilikom querija
    select: '-__v -passwordChangedAt' // koja polja NE ZELIM da mi ubaci u embeded objekt
  });
  next();
});

// pre hook - primjera koji samo baca na konzolu
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
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //ovo je NOT EQUAL = true ... seacretTour: false isto prolazi

  next();
});

/******************************************** */
const Tour = mongoose.model('Tour', tourSchema);
/******************************************** */

module.exports = Tour;
