const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AUDIT_ACTIONS, AUDIT_RESOURCE_TYPES } = require("../middleware/auditAfterSuccess");

// ─── LOGIN ───────────────────────────────────────────────
// authenticate.js expects token with { userId, role }
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    const [rows] = await db.query(
      "SELECT user_id, full_name, username, password_hash, role, status FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const user = rows[0];

    // Check account is active
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is suspended. Contact admin."
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    // Create JWT — authenticate.js decodes { userId, role }
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Audit log login
    await res.audit(
      AUDIT_ACTIONS.USER_LOGGED_IN,
      AUDIT_RESOURCE_TYPES.USER,
      user.user_id,
      { username: user.username, role: user.role }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id:       user.user_id,
        fullName: user.full_name,
        username: user.username,
        role:     user.role
      }
    });

  } catch (error) {
    next(error);
  }
};

// ─── GET CURRENT USER ────────────────────────────────────
// Uses req.user set by authenticate.js { id, role }
const getMe = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, full_name, username, role, status, created_at FROM users WHERE user_id = ? LIMIT 1",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user: rows[0]
    });

  } catch (error) {
    next(error);
  }
};

// ─── CHANGE PASSWORD ─────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters"
      });
    }

    const [rows] = await db.query(
      "SELECT password_hash FROM users WHERE user_id = ? LIMIT 1",
      [req.user.id]
    );

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await db.query(
      "UPDATE users SET password_hash = ? WHERE user_id = ?",
      [newHash, req.user.id]
    );

    await res.audit(
      AUDIT_ACTIONS.USER_PASSWORD_CHANGED,
      AUDIT_RESOURCE_TYPES.USER,
      req.user.id,
      { changedBy: req.user.id }
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe, changePassword };
