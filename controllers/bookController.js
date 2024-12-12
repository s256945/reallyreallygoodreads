const db = require("../config/database");

// Function to retrieve all books from the database
exports.getAllBooks = async (req, res) => {
  try {
    // Selects all books from the DB
    const [rows, fields] = await db.execute("SELECT * FROM books");
    // Respond with the rows (books) as a JSON object.
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

// Function to retrieve a specific book by its ID from the database
exports.getBookById = async (req, res) => {
  // Retrieve the book ID from the URL parameters
  const bookId = req.params.id;
  try {
    // Select the book with the specific ID from the DB
    const [rows, fields] = await db.execute(
      "SELECT * FROM books WHERE id = ?",
      [bookId]
    );
    // If the book is found, send the first row (book) as a JSON response
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};
