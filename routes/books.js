const express = require("express");
const router = express.Router();
const db = require("../config/database");
const reviewController = require("../controllers/reviewController");

router.get("/", async (req, res) => {
  try {
    const [bookRows] = await db.execute("SELECT * FROM books");

    res.render("books", { books: bookRows });
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).send("Error fetching books");
  }
});

router.get("/:id", async (req, res) => {
  const bookId = req.params.id;

  try {
    const [bookRows] = await db.execute("SELECT * FROM books WHERE id = ?", [
      bookId,
    ]);

    const [reviewRows] = await db.execute(
      "SELECT * FROM reviews WHERE book_id = ?",
      [bookId]
    );

    res.render("book-details", { book: bookRows[0], reviews: reviewRows });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching book details");
  }
});

router.post("/add", async (req, res) => {
  const { title, author, description, genre, publishedDate, isbn } = req.body;

  if (!title || !author || !description || !genre || !publishedDate || !isbn) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided." });
  }

  try {
    await db.execute(
      "INSERT INTO books (title, author, description, genre, published_date, isbn) VALUES (?, ?, ?, ?, ?, ?)",
      [title, author, description, genre, publishedDate, isbn]
    );

    res.status(200).json({ message: "Book added successfully" });
  } catch (error) {
    console.error("Error adding book:", error.message);
    res.status(500).json({ message: "Error adding book" });
  }
});

module.exports = router;
