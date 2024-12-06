module.exports = {
  authMiddleware: (req, res, next) => {
    res.locals.user = req.session.user;
    if (!req.session.user) {
      return res.redirect("/login");
    }
    next();
  },

  isAdmin: (req, res, next) => {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).send("Access denied. Admins only.");
    }
    next();
  },
};
