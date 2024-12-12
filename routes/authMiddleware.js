const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.locals.user = req.session.user;
  next();
};

const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).send("Access denied. Admins only.");
  }
  next();
};

module.exports = { authMiddleware, isAdmin };
