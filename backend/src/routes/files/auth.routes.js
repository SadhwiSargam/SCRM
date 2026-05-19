const express = require("express");
const router = express.Router();

const { login, getMe, changePassword } = require("../controllers/auth.controller");
const authenticate = require("../middleware/authenticate");
const { auditAfterSuccess } = require("../middleware/auditAfterSuccess");
const rateLimiter = require("../middleware/rateLimiter");

// ─── PUBLIC ───────────────────────────────────────────────
// POST /api/auth/login
router.post("/login", rateLimiter, auditAfterSuccess, login);

// ─── PROTECTED ────────────────────────────────────────────
// GET  /api/auth/me
router.get("/me", authenticate, getMe);

// PUT  /api/auth/change-password
router.put("/change-password", authenticate, auditAfterSuccess, changePassword);

module.exports = router;
