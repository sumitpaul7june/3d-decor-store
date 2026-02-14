export const adminOnly = (req, res, next) => {
    console.log("USER ROLE:", req.user.role);
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};
