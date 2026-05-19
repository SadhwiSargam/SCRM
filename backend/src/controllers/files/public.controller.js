const db = require("../config/db");

// ─── GET PUBLIC SAFE CASE INFO ───────────────────────────
// No auth needed — public can view basic info only
// Sensitive info like victims, witnesses HIDDEN
const getPublicCases = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        case_id,
        title,
        status,
        priority,
        created_at
       FROM cases
       WHERE status != 'closed' AND deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT 20`
    );

    return res.status(200).json({
      success: true,
      message: "Public case information",
      count: rows.length,
      cases: rows
    });

  } catch (error) {
    next(error);
  }
};

// ─── SUBMIT ANONYMOUS CRIME REPORT ───────────────────────
// Public submits report — no login needed
const submitReport = async (req, res, next) => {
  try {
    const { report_text, location } = req.body;

    if (!report_text || !location) {
      return res.status(400).json({
        success: false,
        message: "report_text and location are required"
      });
    }

    if (report_text.length < 20) {
      return res.status(400).json({
        success: false,
        message: "Report must be at least 20 characters"
      });
    }

    const [result] = await db.query(
      `INSERT INTO reports (report_text, location, report_status)
       VALUES (?, ?, 'pending')`,
      [report_text, location]
    );

    return res.status(201).json({
      success: true,
      message: "Crime report submitted successfully. Thank you for helping keep the community safe.",
      reportId: result.insertId
    });

  } catch (error) {
    next(error);
  }
};

// ─── GET PUBLIC CRIMINAL ALERTS ──────────────────────────
// Only shows alias_name and crime_type — no sensitive info
const getCriminalAlerts = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        criminal_id,
        alias_name,
        crime_type,
        risk_level,
        status
       FROM criminal_profiles
       WHERE status = 'active'
       AND risk_level IN ('high', 'critical')
       ORDER BY risk_level DESC`
    );

    return res.status(200).json({
      success: true,
      message: "Active high-risk criminal alerts",
      count: rows.length,
      alerts: rows
    });

  } catch (error) {
    next(error);
  }
};

// ─── CHECK REPORT STATUS ─────────────────────────────────
// Public can track their report using report ID
const checkReportStatus = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    const [rows] = await db.query(
      `SELECT report_id, report_status, submitted_at
       FROM reports
       WHERE report_id = ? LIMIT 1`,
      [reportId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    return res.status(200).json({
      success: true,
      report: rows[0]
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getPublicCases, submitReport, getCriminalAlerts, checkReportStatus };
