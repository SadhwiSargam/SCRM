const db = require("../config/db");
const bcrypt = require("bcrypt");
const { AUDIT_ACTIONS, AUDIT_RESOURCE_TYPES } = require("../middleware/auditAfterSuccess");

// ─── GET ALL USERS — admin only ──────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, full_name, username, role, status, created_at FROM users ORDER BY created_at DESC"
    );

    await res.audit(
      AUDIT_ACTIONS.USER_CREATED,
      AUDIT_RESOURCE_TYPES.USER,
      null,
      { action: "viewed all users", count: rows.length }
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      users: rows
    });

  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE USER — admin only ────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT user_id, full_name, username, role, status, created_at FROM users WHERE user_id = ? LIMIT 1",
      [id]
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

// ─── CREATE USER — admin only ────────────────────────────
const createUser = async (req, res, next) => {
  try {
    const { full_name, username, password, role } = req.body;

    // Validation
    if (!full_name || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "full_name, username, password and role are required"
      });
    }

    const validRoles = ["admin", "officer", "stf", "public"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${validRoles.join(", ")}`
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    // Check username exists
    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username already exists"
      });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      "INSERT INTO users (full_name, username, password_hash, role) VALUES (?, ?, ?, ?)",
      [full_name, username, password_hash, role]
    );

    await res.audit(
      AUDIT_ACTIONS.USER_CREATED,
      AUDIT_RESOURCE_TYPES.USER,
      result.insertId,
      { createdBy: req.user.id, newUser: username, role }
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      userId: result.insertId
    });

  } catch (error) {
    next(error);
  }
};

// ─── UPDATE USER — admin only ────────────────────────────
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, role, status } = req.body;

    // Get before data for audit
    const [before] = await db.query(
      "SELECT user_id, full_name, role, status FROM users WHERE user_id = ? LIMIT 1",
      [id]
    );

    if (before.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const validRoles = ["admin", "officer", "stf", "public"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${validRoles.join(", ")}`
      });
    }

    const validStatuses = ["active", "suspended"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or suspended"
      });
    }

    await db.query(
      `UPDATE users SET 
        full_name = COALESCE(?, full_name),
        role      = COALESCE(?, role),
        status    = COALESCE(?, status)
       WHERE user_id = ?`,
      [full_name || null, role || null, status || null, id]
    );

    // Get after data
    const [after] = await db.query(
      "SELECT user_id, full_name, role, status FROM users WHERE user_id = ? LIMIT 1",
      [id]
    );

    await res.auditWithChanges(
      AUDIT_ACTIONS.USER_UPDATED,
      AUDIT_RESOURCE_TYPES.USER,
      id,
      before[0],
      after[0]
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: after[0]
    });

  } catch (error) {
    next(error);
  }
};

// ─── DELETE USER — admin only ────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }

    const [existing] = await db.query(
      "SELECT user_id, username FROM users WHERE user_id = ? LIMIT 1",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await db.query("DELETE FROM users WHERE user_id = ?", [id]);

    await res.audit(
      AUDIT_ACTIONS.USER_DELETED,
      AUDIT_RESOURCE_TYPES.USER,
      id,
      { deletedBy: req.user.id, deletedUser: existing[0].username }
    );

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
