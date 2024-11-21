const db = require("../config/database");

exports.addReview = async (req, res) => {
  const { bookId, reviewer, reviewText, rating } = req.body;

  if (!bookId || !reviewer || !reviewText || !rating) {
    console.error("Missing required fields");
    return res.status(400).send("All fields are required");
  }

  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).send("Rating must be between 1 and 5");
  }

  try {
    await db.execute(
      "INSERT INTO reviews (book_id, reviewer, review_text, rating) VALUES (?, ?, ?, ?)",
      [bookId, reviewer, reviewText, rating]
    );
    res.redirect(`/books/${bookId}`);
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).send("Error adding review");
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const [reviews] = await db.execute(
      `SELECT reviews.*, books.title, books.genre 
       FROM reviews
       JOIN books ON reviews.book_id = books.id`
    );

    const [users] = await db.execute("SELECT DISTINCT reviewer FROM reviews");
    const uniqueUsers = users.map((user) => user.reviewer);

    const [genres] = await db.execute("SELECT DISTINCT genre FROM books");

    const allGenres = genres
      .map((genre) => genre.genre)
      .flatMap((genre) => genre.split(",").map((g) => g.trim()))
      .filter((genre, index, self) => self.indexOf(genre) === index);

    res.render("reviews", { reviews, uniqueUsers, uniqueGenres: allGenres });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).send("Error fetching all reviews");
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const user = req.session.user;

    const [reviews] = await db.execute(
      `SELECT reviews.*, books.title, books.genre 
       FROM reviews
       JOIN books ON reviews.book_id = books.id
       WHERE reviews.reviewer = ?`,
      [user.username]
    );

    const [genres] = await db.execute("SELECT DISTINCT genre FROM books");

    const allGenres = genres
      .map((genre) => genre.genre)
      .flatMap((genre) => genre.split(",").map((g) => g.trim()))
      .filter((genre, index, self) => self.indexOf(genre) === index);

    res.render("my-reviews", {
      reviews,
      uniqueGenres: allGenres,
      user: user.username,
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).send("Error fetching reviews");
  }
};

exports.editReview = async (req, res) => {
  const { reviewId, reviewText, rating } = req.body;
  const reviewer = req.session.user.username;

  if (!reviewId || !reviewText || !rating) {
    return res.status(400).send("All fields are required");
  }

  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).send("Rating must be between 1 and 5");
  }

  try {
    await db.execute(
      `UPDATE reviews SET review_text = ?, rating = ? WHERE review_id = ? AND reviewer = ?`,
      [reviewText, rating, reviewId, reviewer]
    );
    res.json({
      success: true,
      review: { id: reviewId, reviewText, rating },
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).send("Error updating review");
  }
};

exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const reviewer = req.session.user.username;

  try {
    if (!reviewId) {
      return res
        .status(400)
        .json({ success: false, message: "Review ID is required" });
    }

    const [result] = await db.execute(
      `DELETE FROM reviews WHERE review_id = ? AND reviewer = ?`,
      [reviewId, reviewer]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).send("Error deleting review");
  }
};
