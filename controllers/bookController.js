const db = require("../config/database");

// Function to retrieve all books from the database
exports.getAllBooks = async (req, res) => {
  try {
    // Selects all books from the DB
    const [bookRows] = await db.execute("SELECT * FROM books");

    // Render the books page
    res.render("books", { books: bookRows, user: req.session.user });
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).send("Error fetching books");
  }
};

// Function to retrieve a specific book by its ID from the database
exports.getBookById = async (req, res) => {
  // Retrieve the book ID from the URL parameters
  const bookId = req.params.id;
  try {
    // Select the book with the specific ID from the DB
    const [bookRows] = await db.execute("SELECT * FROM books WHERE id = ?", [
      bookId,
    ]);

    // Render the book details page
    res.render("book-details", { book: bookRows[0], reviews: reviewRows });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching book details");
  }
};

// Function to add a new book
exports.addNewBook = async (req, res) => {
  // Destructure the request body to get required details
  const { title, author, description, genre, publishedDate, isbn } = req.body;

  // Check all the required fields are provided
  if (!title || !author || !description || !genre || !publishedDate || !isbn) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided." });
  }

  // Add the new book into the DB
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
};
