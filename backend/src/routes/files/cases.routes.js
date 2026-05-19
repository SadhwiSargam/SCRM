const express = require("express");
const router = express.Router();

const {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  closeCase,
} = require("../controllers/cases.controller");

const authenticate          = require("../middleware/authenticate");
const authorizeRoles        = require("../middleware/authorizeRoles");
const requireCaseAccess     = require("../middleware/requireCaseAccess");
const { auditAfterSuccess } = require("../middleware/auditAfterSuccess");

// All routes require login + audit
router.use(authenticate, auditAfterSuccess);

// GET  /api/cases          — admin, stf (all) | officer (assigned only)
router.get(
  "/",
  authorizeRoles("admin", "stf", "officer"),
  getAllCases
);

// GET  /api/cases/:caseId  — admin, stf, officer (must be assigned)
router.get(
  "/:caseId",
  authorizeRoles("admin", "stf", "officer"),
  requireCaseAccess,
  getCaseById
);

// POST /api/cases          — admin, stf only
router.post(
  "/",
  authorizeRoles("admin", "stf"),
  createCase
);

// PUT  /api/cases/:caseId  — admin, stf, officer (must be assigned)
router.put(
  "/:caseId",
  authorizeRoles("admin", "stf", "officer"),
  requireCaseAccess,
  updateCase
);

// PATCH /api/cases/:caseId/close — admin, stf only
router.patch(
  "/:caseId/close",
  authorizeRoles("admin", "stf"),
  closeCase
);

// DELETE /api/cases/:caseId — admin only
router.delete(
  "/:caseId",
  authorizeRoles("admin"),
  deleteCase
);

module.exports = router;
