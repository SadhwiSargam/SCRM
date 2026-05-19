const express = require("express");
const router = express.Router();

const {
  getAllLogs,
  getUserLogs,
  getCaseLogs,
  getSuspiciousActivity,
  getAuditSummary,
} = require("../controllers/audit.controller");

const authenticate          = require("../middleware/authenticate");
const authorizeRoles        = require("../middleware/authorizeRoles");

// All audit routes — admin only, no audit logging of audits to avoid loops
router.use(authenticate, authorizeRoles("admin"));

// GET  /api/audit                         — paginated, filterable log list
//   ?page=1&limit=50&action=CASE_CREATED&user_id=5&from_date=...&to_date=...
router.get("/", getAllLogs);

// GET  /api/audit/summary                 — dashboard summary (7-day window)
router.get("/summary", getAuditSummary);

// GET  /api/audit/suspicious              — flagged users & IPs
router.get("/suspicious", getSuspiciousActivity);

// GET  /api/audit/user/:userId            — logs for a specific user
router.get("/user/:userId", getUserLogs);

// GET  /api/audit/case/:caseId            — logs for a specific case
router.get("/case/:caseId", getCaseLogs);

module.exports = router;
