const express = require("express");
const router = express.Router();

const {
  getAllAssignments,
  getMyAssignments,
  assignOfficer,
  removeAssignment,
} = require("../controllers/assignments.controller");

const authenticate          = require("../middleware/authenticate");
const authorizeRoles        = require("../middleware/authorizeRoles");
const { auditAfterSuccess } = require("../middleware/auditAfterSuccess");

// All routes require login + audit
router.use(authenticate, auditAfterSuccess);

// GET  /api/assignments            — admin, stf
router.get(
  "/",
  authorizeRoles("admin", "stf"),
  getAllAssignments
);

// GET  /api/assignments/my         — officer only
router.get(
  "/my",
  authorizeRoles("officer"),
  getMyAssignments
);

// POST /api/assignments            — admin only
router.post(
  "/",
  authorizeRoles("admin"),
  assignOfficer
);

// DELETE /api/assignments/:id      — admin only
router.delete(
  "/:id",
  authorizeRoles("admin"),
  removeAssignment
);

module.exports = router;
