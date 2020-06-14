const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../../models/tourModel");
const Review = require("../../models/reviewModel");
const User = require("../../models/userModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("connected to database");
  });

//read json file with tours examples
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
//read json file with tours examples
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
//read json file with tours examples
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);

//import data to database
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log("data successfully loaded");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// delete all data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("data successfully deleted");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}

// console.log(process.argv);
