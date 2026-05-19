const express = require("express");
const router = express.Router();

const {
  getAllRequests,
  createRequest,
  approveRequest,
  rejectRequest,
  getAllApprovals,
} = require("../controllers/approvals.controller");

const authenticate          = require("../middleware/authenticate");
const authorizeRoles        = require("../middleware/authorizeRoles");
const { auditAfterSuccess } = require("../middleware/auditAfterSuccess");

// All routes require login + audit
router.use(authenticate, auditAfterSuccess);

// ─── CHANGE REQUESTS ──────────────────────────────────────

// GET  /api/approvals/requests           — admin only
router.get(
  "/requests",
  authorizeRoles("admin"),
  getAllRequests
);

// POST /api/approvals/requests           — officer, stf
router.post(
  "/requests",
  authorizeRoles("officer", "stf"),
  createRequest
);

// PUT  /api/approvals/requests/:id/approve — admin only
router.put(
  "/requests/:id/approve",
  authorizeRoles("admin"),
  approveRequest
);

// PUT  /api/approvals/requests/:id/reject  — admin only
router.put(
  "/requests/:id/reject",
  authorizeRoles("admin"),
  rejectRequest
);

// ─── APPROVALS ────────────────────────────────────────────

// GET  /api/approvals                    — admin only
router.get(
  "/",
  authorizeRoles("admin"),
  getAllApprovals
);

module.exports = router;
