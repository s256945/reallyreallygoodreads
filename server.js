const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const crypto = require("crypto");
const mysqlStore = require("express-mysql-session")(session);

const app = express();
const booksRouter = require("./routes/books");
const reviewsRouter = require("./routes/reviews");
const authRouter = require("./routes/auth");
const { authMiddleware } = require("./routes/authMiddleware");

require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const options = {
  connectionLimit: 10,
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  createDatabaseTable: false,
  schema: {
    tableName: "sessions",
    columnNames: {
      session_id: "session_id",
      expires: "expires",
      data: "data",
    },
  },
};

const sessionStore = new mysqlStore(options);

app.use(
  session({
    name: process.env.SESS_NAME || "sessionId",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    secret: process.env.SESS_SECRET || crypto.randomBytes(64).toString("hex"),
    cookie: {
      httpOnly: true,
      maxAge: 7200000,
      sameSite: true,
      secure: process.env.NODE_ENV === "production",
    },
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
