// middleware/auth.js

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "mainAdmin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};

exports.isMainAdmin = (req, res, next) => {
  if (req.user.role === "mainAdmin") {
    return next();
  }
  return res.status(403).json({ message: "Main admin access required" });
};

exports.isFaculty = (req, res, next) => {
  if (req.user.role === "faculty") {
    return next();
  }
  return res.status(403).json({ message: "Faculty access required" });
};
