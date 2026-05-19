const express = require("express");
const router = express.Router();

const {
  getPublicCases,
  submitReport,
  getCriminalAlerts,
  checkReportStatus,
} = require("../controllers/public.controller");

const rateLimiter = require("../middleware/rateLimiter");

// All public routes — no authentication required
// Rate limiter applied to prevent abuse

// GET  /api/public/cases                 — open cases (safe fields only)
router.get("/cases", rateLimiter, getPublicCases);

// POST /api/public/report                — anonymous crime report submission
router.post("/report", rateLimiter, submitReport);

// GET  /api/public/alerts                — active high-risk criminal alerts
router.get("/alerts", rateLimiter, getCriminalAlerts);

// GET  /api/public/report/:reportId      — check status of a submitted report
router.get("/report/:reportId", rateLimiter, checkReportStatus);

module.exports = router;
