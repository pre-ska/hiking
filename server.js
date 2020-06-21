const mongoose = require("mongoose");
const dotenv = require("dotenv");

// 9-14 hvatanje uncaught exception - globalno u cijeloj aplikaciji
process.on("uncaughtException", (err) => {
  console.log("uncaught exception!... shutting down");
  console.log(err.name, err.message);
  process.exit(1); //0-success, 1- unhandledRejection
});

// mora biti prije app-a
dotenv.config({ path: "./config.env" });

const app = require("./app");

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
  .then(() => {
    console.log("connected to database");
  });

// start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});

// 9-13 hvatanje unhandled promise rejection - globalno u cijeloj aplikaciji
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION!... shutting down");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); //0-success, 1- unhandledRejection
  });
});

// 14-8
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
