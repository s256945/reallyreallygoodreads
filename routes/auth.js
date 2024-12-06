const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/login", (req, res) => {
  res.render("login", {
    user: req.session.user || null,
    errorMessage: req.query.errorMessage || null,
    successMessage: req.query.successMessage || null,
  });
});

router.get("/register", (req, res) => {
  res.render("login", {
    user: req.session.user || null,
    errorMessage: req.query.errorMessage || null,
    successMessage: req.query.successMessage || null,
  });
});

router.post("/login", authController.login);

router.post("/register", authController.register);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.redirect("/login");
  });
});

module.exports = router;
