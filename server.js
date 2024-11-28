const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const booksRouter = require("./routes/books");
const reviewsRouter = require("./routes/reviews");
const authRouter = require("./routes/auth");
const authMiddleware = require("./routes/authMiddleware");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "session-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/", authRouter);

app.use("/books", authMiddleware, booksRouter);

app.use("/reviews", authMiddleware, reviewsRouter);

app.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
