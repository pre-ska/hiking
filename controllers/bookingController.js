//13-14
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");

/*
  u 13-17 sam dodao query string na success url
  jer nakon što Stripe obavi transakciju, redirekta na root stranicu "/"
  tada želim da spremim booking u moj database i ti query stringovi će mi to omogiućiti
  imam sve podatke u niima, i spremam samo u slučaju da imam te stringove...ako ih nemam, to je normalno otvaranje stranice
  i ništa ne radim
  OVO JE SAMO PRIVREMENO JER OVO NIJE SIGURNO!!!!!
  svako može napisati taj string sa frontenda i aktivirati spremanje bookinga u database bez obavljene transakcije
  kasnije ću to promjeniti sa Stripe web hooksima
*/
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) get currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log("tour price ", tour);
  // 2) create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: "usd",
        quantity: 1,
      },
    ],
  });

  // 3) create session as response
  res.status(200).json({
    status: "success",
    session,
  });
});

//13-17
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // OVO JE SAMO PRIVREMENO
  const { tour, user, price } = req.query;

  // ovo je na ruti GET "/"...ako nema ovih query stringova samo nastavi dalje normalno (viewRouter.js)
  if (!tour || !user || !price) return next();

  //ako ih ima spremi novi booking u DB
  await Booking.create({ tour, user, price });

  // nakon snimanja redirektaj na rutu "/" BEZ!!! query stringova... u biti ista ta ruta bez ?...tour, price, user
  res.redirect(req.originalUrl.split("?")[0]);
});

//13-19
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);