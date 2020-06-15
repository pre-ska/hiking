//12-8 refactoring

const express = require("express");
const viewsController = require("../controllers/viewsController");

const router = express.Router();

//12-03 render template --- ovo nema...sve ide na overview
// router.get("/", (req, res) => {
//   res.status(200).render("base", {
//     tour: "The Forest Hiker",
//     user: "Wolf",
//   });
// });

//12-7
router.get("/", viewsController.getOverview);
//12-7
router.get("/tour", viewsController.getTour);

module.exports = router;
