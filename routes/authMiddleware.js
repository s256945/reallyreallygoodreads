module.exports = (req, res, next) => {
    res.locals.user = req.session.user;
    if (!req.session.user) {
      return res.redirect('/login');
    }
    next();
  };
  