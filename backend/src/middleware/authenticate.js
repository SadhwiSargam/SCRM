const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      "SELECT user_id, role, status FROM users WHERE user_id = ? LIMIT 1",
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const user = rows[0];

    if (user.status !== "active") {
      return res.status(403).json({ success: false, message: "User account is inactive" });
    }

    req.user = { id: user.user_id, role: user.role };
    next();

  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = authenticate;