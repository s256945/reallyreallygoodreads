const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

router.get("/", bookController.getAllBooks);

router.get("/:id", bookController.getBookById);

router.post("/add", bookController.addNewBook);

module.exports = router;
