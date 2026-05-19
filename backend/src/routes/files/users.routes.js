const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");

const authenticate     = require("../middleware/authenticate");
const authorizeRoles   = require("../middleware/authorizeRoles");
const { auditAfterSuccess } = require("../middleware/auditAfterSuccess");

// All user management routes — admin only
router.use(authenticate, authorizeRoles("admin"), auditAfterSuccess);

// GET  /api/users
router.get("/", getAllUsers);

// GET  /api/users/:id
router.get("/:id", getUserById);

// POST /api/users
router.post("/", createUser);

// PUT  /api/users/:id
router.put("/:id", updateUser);

// DELETE /api/users/:id
router.delete("/:id", deleteUser);

module.exports = router;
