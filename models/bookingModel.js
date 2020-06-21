//13-16
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour", // kako povezati razlicite datasetove - cita Tour model - nemoram niti importirati tourModel dokument
    required: [true, "Booking must belong to a tour"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User", // kako povezati razlicite datasetove - cita User model - nemoram niti importirati userModel dokument
    required: [true, "Booking must belong to a user"],
  },
  price: {
    type: Number,
    require: [true, "Booking must have a price"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

//PRE middleware - uvijek mora završiti sa next()
// bilo koji query koji počinje sa FIND želim da mi popuni polja od ture i usera sa realnim objektima
// trenutno u DB su samo IDjevi od njih
bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "tour",
    select: "name",
  });
  next();
});

/******************************************** */
const Booking = mongoose.model("Booking", bookingSchema);
/******************************************** */

module.exports = Booking;
