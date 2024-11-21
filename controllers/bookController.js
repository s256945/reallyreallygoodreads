const db = require('../config/database');

exports.getAllBooks = async (req, res) => {
  try {
    const [rows, fields] = await db.execute('SELECT * FROM books');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Database error');
  }
};

exports.getBookById = async (req, res) => {
  const bookId = req.params.id;
  try {
    const [rows, fields] = await db.execute('SELECT * FROM books WHERE id = ?', [bookId]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Database error');
  }
};
