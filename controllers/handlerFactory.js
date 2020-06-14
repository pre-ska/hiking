//11-15
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures"); //11-17

// cilj je napraviti funkciju koja ce se koristiti za svaki model
//zove se tako jer brise ili jednu turu, ili reviews ili usera itd
// pustim joj model i ona ce vratiti async handler funkciju...napravim closure
// template mi je deleteTour iz tourController.js
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

//11-16 FF za update pojedinacnog dokumenta
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // vrati novi dokument
      runValidators: true, //ako je false, validatori iz modela nece se primjenjivati na update (samo na create)
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

//11-16 - refactoring iz tourController createTour funkcije
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

//11-17
// puštam populate jer tourController -> getTour ima populate u sebi a druge funkcije to nemaju
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate("reviews");

    const doc = await query;
    if (!doc) {
      // 9-8
      return next(new AppError("No Document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });

    //9-7 refactoring
    // } catch (error) {
    //   res.status(404).json({
    //     status: 'fail',
    //     message: 'Invalid request'
    //   });
    // }
  });

//11-17
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    /************************************/
    //ovo je samo za reviews
    // i to , nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    /************************************/

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const doc = await features.query.explain(); // ovo vrati statistiku
    const doc = await features.query;

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
