const isAdmin = (req, res, next) => {
    // protect middleware se req.user aa chuka hoga
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ message: "Admin access only" });
    }
  };
  
  module.exports = { isAdmin };
  