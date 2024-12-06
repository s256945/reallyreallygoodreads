const bcrypt = require("bcryptjs");
const db = require("../config/database");

exports.register = async (req, res) => {
  const { username, email, password, role = "user" } = req.body;

  try {
    const [existingUser] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return res.render("login", {
        errorMessage:
          "Username already exists, please try again with a different username",
        successMessage: null,
        user: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role]
    );

    return res.render("login", {
      successMessage:
        "Registration successful, please log in with your new username and password",
      errorMessage: null,
      user: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user");
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.render("login", {
        errorMessage:
          "User not found, please try again with a different username, or register",
        successMessage: null,
        user: null,
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", {
        errorMessage:
          "Invalid credentials, please try with a different password",
        successMessage: null,
        user: null,
      });
    }

    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.redirect("/books");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
};
