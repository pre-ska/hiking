const Tour = require('../models/tourModel'); // 8-7
const APIFeatures = require('../utils/apiFeatures'); //8-20

// ova funkcija/logika je shit...trebao sam samo u catch bloku napravit poziv next() sa new AppError
// nemoj ovako radit
const catchAsync = require('../utils/catchAsync'); //9-7

const AppError = require('../utils/appError');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

//i onda definiram njegovu middleware funkciju
// u PARAM MIDDLEWARE funkciji imam i cetvrti argument - vrijednost samog parametra
// exports.checkID = (req, res, next, val) => {
//   if (val * 1 > tours.length) {
//     //prekinem izvodjenje sa return...inace bi next() prosao
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid id'
//     });
//   }

//   next();
// };  NIJE VISE FUNKCIONALNO

// ako u post metodi nema u body-u name ili price...odbaci
// u suprotnom nastavi sa next()
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }

//   next();
// }; NEPOTREBNO NAKON REFACTORINGA 8-8... u realnom DB moongose ce to radit

// route handlers - controllers
// https://mongoosejs.com/docs/queries.html

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //8-9
  // try {
  //8-14
  // moram prvo kopirati query obj, zatim izbaciti iz njega sve propse koji nisu dio pretrage
  // npr pagination isto ide u query string, ali nemogu pretrazivati DB po tom parametru
  // koristim array kao popis svih parametara koje izbacivam
  // const queryObj = { ...req.query };
  // const excludedFields = ['page', 'sort', 'limit', 'fields'];
  // excludedFields.forEach(el => delete queryObj[el]); // vrtim array i brisem sve ako postoje sa tim parametrom u kopiji query stringa

  // // -- BUILDING QUERY STRING 8-14 i 15
  // //ako stavim u adresu npr. duration[gte] = 5 (greater than or equal)
  // // express ce to procitati kao { duration: { gte: 5}}... fali mi "$" znak prije gte
  // // zato moram napraviti dodatni filter koji će istestirat query i zamjeniti nepravilnu sintaxu
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // dodam "$" na pocetak

  // let query = Tour.find(JSON.parse(queryStr)); // spremam query object u varijablu da bi kasnije mogao vezati druge metode... npr. sort

  // -- SORTING !!!!!!!!!!!!!!!!!!!!!
  //8 - 16;
  // ako zelim sortirati po vise kriterija npr. price i ako ima vise njih sa istim price onda dodatno po imenu
  // to pisem sort('price name')
  //medjutim, u adresnom baru nabrajam ih sa zarezom i onda taj zarez zamjenim u sort filteru sa space
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.replace(/,/g, ' ');
  //   //ako ima sorting u query stringu, lancano ga povezi na postojeci query

  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-createdAt');
  // }

  // -- PROJECTING !!!!!!!!!!!!!!!!!!
  // 8-17
  // field limiting - koje propse da vrati... npr. samo name i price
  // if (req.query.fields) {
  //   const fields = req.query.fields.replace(/,/g, ' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v'); // ovo je za excluding... nepotrebno, vise za primjer kako se radi
  // }

  // -- PAGINATION !!!!!!!!!!!!!
  //8-18
  // const page = req.query.page * 1 || 1; // page u query obj je string, monozenje sa 1 daje number
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page - 1) * limit;

  //.....page=2&limit(10), 1-10 page 1, 11-20 page 2....
  // query = query.skip(skip).limit(limit); // metode iz mongoose

  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments(); // broj dokumenata u kolekciji
  //   if (skip >= numTours / limit) {
  //     throw new Error('This page does not exists');
  //   }
  // }

  // -- EXECUTE QUERY 8-14 i 15... u ovom trenutku sve sto treba je u query dokumentu skupljeno
  // query.sort().select().skip().limit()....
  // 8-20
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // -- SEND RESPONSE!!!!!!!!!!!!!
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
  //9-7 refactoring
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});

exports.getTour = catchAsync(async (req, res, next) => {
  // try {
  const tour = await Tour.findById(req.params.id).populate('guides'); // poplate sam dodao u 11-7
  // shorthand iz mongoose za :
  // Tour.findOne({_id: req.params.id})

  if (!tour) {
    // 9-8
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });

  //9-7 refactoring
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid request'
  //   });
  // }
});

// refactoring in 9-7 catchAsync
exports.createTour = catchAsync(async (req, res, next) => {
  // const newTour = new Tour({
  //   ....
  // })
  // newTour.save()
  // model.prototype.save() je metoda na dokumentu koji je kreiran pomocu modela Tour
  // model.create() je metoda na samom modelu
  // prije sam kreirao doc i na njemu pozvao save()
  //sada direkno na modelu pozivam create()
  //8-8

  // u 9-7 radim refaktoring...stavljam sve u funkciju koja hvata error catchAsync(), uhvati ga zato sto je promise rejected
  // try {
  //   const newTour = await Tour.create(req.body);

  //   res.status(201).json({
  //     status: 'success',
  //     data: {
  //       tour: newTour
  //     }
  //   });
  // } catch (error) {
  //   res.status(400).json({
  //     // 400 je bad request
  //     status: 'fail',
  //     message: error
  //   });
  // }

  // novi kod, samo try block...9-7
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // try {
  // findByIdAndUpdate() je metoda iz mongoose
  // https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // vrati novi dokument
    runValidators: true //ako je false, validatori iz modela nece se primjenjivati na update (samo na create)
  });

  if (!tour) {
    // 9-8
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
  // 9-7 refactoring
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  // try {
  // findByIdAndUpdate() je metoda iz mongoose
  // https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    // 9-8
    return next(new AppError('No tour found with that ID', 404));
  }

  // 204 je no_content...uspjesno odradjen request
  res.status(204).json({
    status: 'success',
    data: null
  });

  //refactoring 9-7
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});

//8-21
exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numOfRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
  //9-7 refactoring
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});

//8-22
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      // svaka tura ima vise startDates
      // unwind ce kreirati nove ture za svaki pojedini startDates u arrayu
      $unwind: '$startDates'
    },
    {
      //dohvati samo one koji su u danoj godini...
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // razvrstaj ih po mjesecima
        numOfTourStarts: { $sum: 1 }, //doda 1 za svaku postojeću turu iz filtera...zbroji ih
        tours: { $push: '$name' } // kreira polje tours koje je array i push u njega ime ture za svaki mjesec
      }
    },
    {
      $addFields: { month: '$_id' } // doda novo polje i poveze ga sa vrijednosti polja _id
    },
    {
      $project: {
        _id: 0 // koja polja ce se prikazati, 1- hoce, 0 -nece
      }
    },
    {
      $sort: { numOfTourStarts: -1 } // poredaj silazno po numOfTourStarts
    },
    {
      $limit: 12 // limitira broj rezultata
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      alo: 'alo',
      plan
    }
  });

  //9-7 refactoring
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});
