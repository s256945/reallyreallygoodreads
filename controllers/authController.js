const bcrypt = require("bcryptjs");
const db = require("../config/database");

// Register function to handle user registration
exports.register = async (req, res) => {
  // Destructure the request body to get username, email, password, and role (defaulting to user)
  const { username, email, password, role = "user" } = req.body;

  try {
    // Check if a user already exists with the provided username
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

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database with the hashed password and assigned role
    await db.execute(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role]
    );

    // Render the login page so new user can now login
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

// Login function to handle user authentication
exports.login = async (req, res) => {
  // Destructure the request body to get username and password
  const { username, password } = req.body;

  try {
    // Query the database to find a user with the provided username
    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    // If no user is found with that username, return an error message
    if (rows.length === 0) {
      return res.render("login", {
        errorMessage:
          "User not found, please try again with a different username, or register",
        successMessage: null,
        user: null,
      });
    }

    // Get the user data from the query result
    const user = rows[0];
    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    // If the passwords don't match, return an error message
    if (!isMatch) {
      return res.render("login", {
        errorMessage:
          "Invalid credentials, please try with a different password",
        successMessage: null,
        user: null,
      });
    }

    // If the credentials are correct, store user information in the session
    req.session.user = { id: user.id, username: user.username, role: user.role };

    // Redirect to the books page
    res.redirect("/books");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
};
