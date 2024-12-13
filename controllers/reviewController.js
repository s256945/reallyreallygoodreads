const db = require("../config/database");

// Function to add a new review for a book
exports.addReview = async (req, res) => {
  // Destructure the required fields from the request body
  const { bookId, reviewer, reviewText, rating } = req.body;

  // Check if any of the required fields are missing
  if (!bookId || !reviewer || !reviewText || !rating) {
    console.error("Missing required fields");
    return res.status(400).send("All fields are required");
  }

  // Validate that the rating is a number between 1 and 5
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).send("Rating must be between 1 and 5");
  }

  try {
    // Insert the new review in the DB
    await db.execute(
      "INSERT INTO reviews (book_id, reviewer, review_text, rating) VALUES (?, ?, ?, ?)",
      [bookId, reviewer, reviewText, rating]
    );
    // Redirect to the books page
    res.redirect(`/books/${bookId}`);
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).send("Error adding review");
  }
};

// Function to retrieve all reviews from the database
exports.getAllReviews = async (req, res) => {
  try {
    // Fetch all reviews from DB
    const [reviews] = await db.execute(
      `SELECT 
        reviews.review_id, 
        reviews.reviewer, 
        reviews.review_text, 
        reviews.rating, 
        reviews.created_at, 
        books.title AS book, 
        books.genre
      FROM 
        reviews
      JOIN 
        books ON reviews.book_id = books.id;`
    );

    // Fetch distinct entities for filtering purposes
    const [users] = await db.execute("SELECT DISTINCT reviewer FROM reviews");
    const uniqueUsers = users.map((user) => user.reviewer);
    const [genres] = await db.execute("SELECT DISTINCT genre FROM books");
    const [books] = await db.execute("SELECT DISTINCT title FROM books");
    const uniqueBooks = books.map((book) => book.title.trim());

    // Process genres into a list of unique genres, handling comma-separated genres
    const allGenres = genres
      .map((genre) => genre.genre)
      .flatMap((genre) => genre.split(",").map((g) => g.trim()))
      .filter((genre, index, self) => self.indexOf(genre) === index);

    // Render the reviews page
    res.render("reviews", {
      reviews,
      uniqueUsers,
      uniqueBooks,
      uniqueGenres: allGenres,
    });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).send("Error fetching all reviews");
  }
};

// Function to retrieve all reviews for the currently logged-in user
exports.getUserReviews = async (req, res) => {
  try {
    const user = req.session.user; // Get the logged-in user's info from the session

    // Fetch reviews written by the logged-in user
    const [reviews] = await db.execute(
      `SELECT reviews.*, books.title, books.genre 
       FROM reviews
       JOIN books ON reviews.book_id = books.id
       WHERE reviews.reviewer = ?`,
      [user.username]
    );

    // Fetch and combine unique genres into a list
    const [genres] = await db.execute("SELECT DISTINCT genre FROM books");
    const allGenres = genres
      .map((genre) => genre.genre)
      .flatMap((genre) => genre.split(",").map((g) => g.trim()))
      .filter((genre, index, self) => self.indexOf(genre) === index);

    // Render the "my-reviews" page
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

// Function to edit a review
exports.editReview = async (req, res) => {
  // Destructure the required fields from the request body
  const { reviewId, reviewText, rating } = req.body;
  const reviewer = req.session.user.username; // Get the logged-in user's info from the session

  // Check if all required fields are present
  if (!reviewId || !reviewText || !rating) {
    return res.status(400).send("All fields are required");
  }

  try {
    // Update the review in the DB with new text and rating
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

// Function to delete a review
exports.deleteReview = async (req, res) => {
  // Destructure the required fields from the request body
  const { reviewId } = req.params;
  const reviewer = req.session.user.username; // Get the logged-in user's info from the session

  try {
    // Check if a reviewId is provided
    if (!reviewId) {
      return res
        .status(400)
        .json({ success: false, message: "Review ID is required" });
    }

    // Remove the review from the DB
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

// Function to get featured reviews
exports.getFeaturedReviews = async (req, res) => {
  try {
    // Fetch all reviews
    const [reviews] = await db.execute(
      `SELECT 
      reviews.review_id, 
      reviews.reviewer, 
      reviews.review_text, 
      reviews.rating, 
      reviews.created_at, 
      books.title AS book, 
      books.genre
    FROM 
      reviews
    JOIN 
      books ON reviews.book_id = books.id;`
    );

    // Shuffle reviews randomly and select first 10
    const shuffledReviews = reviews.sort(() => 0.5 - Math.random());
    const randomReviews = shuffledReviews.slice(0, 10);

    // Render featured page
    res.render("featured", {
      randomReviews,
    });
  } catch (error) {
    console.error("Error fetching random reviews:", error);
    res.status(500).send("Error fetching random reviews");
  }
};
