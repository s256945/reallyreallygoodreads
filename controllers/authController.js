const bcrypt = require("bcryptjs");
const db = require("../config/database");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const [existingUser] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return res.render("login", {
        errorMessage:
          "Username already exists, please try again with a different username",
        user: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);

    res.send("Registration successful");
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
        errorMessage: "User not found, please try again or register",
        user: null,
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", {
        errorMessage:
          "Invalid credentials, please try with a different password",
        user: null,
      });
    }

    req.session.user = { id: user.id, username: user.username };

    res.redirect("/books");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
};