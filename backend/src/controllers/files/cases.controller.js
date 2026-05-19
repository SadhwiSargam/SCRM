const db = require("../config/db");
const { AUDIT_ACTIONS, AUDIT_RESOURCE_TYPES } = require("../middleware/auditAfterSuccess");

// ─── GET ALL CASES ───────────────────────────────────────
// admin/stf → all cases
// officer   → only assigned cases
const getAllCases = async (req, res, next) => {
  try {
    let query;
    let params = [];

    if (req.user.role === "admin" || req.user.role === "stf") {
      query = `
        SELECT c.*, u.full_name AS created_by_name
        FROM cases c
        LEFT JOIN users u ON c.created_by = u.user_id
        WHERE c.deleted_at IS NULL
        ORDER BY c.created_at DESC
      `;
    } else if (req.user.role === "officer") {
      // Officers only see assigned cases
      query = `
        SELECT c.*, u.full_name AS created_by_name
        FROM cases c
        LEFT JOIN users u ON c.created_by = u.user_id
        INNER JOIN case_assignments ca ON ca.case_id = c.case_id
        WHERE ca.user_id = ? AND c.deleted_at IS NULL
        ORDER BY c.created_at DESC
      `;
      params = [req.user.id];
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const [rows] = await db.query(query, params);

    await res.audit(
      AUDIT_ACTIONS.CASE_VIEWED,
      AUDIT_RESOURCE_TYPES.CASE,
      null,
      { viewedBy: req.user.id, role: req.user.role, count: rows.length }
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      cases: rows
    });

  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE CASE ─────────────────────────────────────
// requireCaseAccess middleware already verified access
const getCaseById = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const [caseRows] = await db.query(
      `SELECT c.*, u.full_name AS created_by_name
       FROM cases c
       LEFT JOIN users u ON c.created_by = u.user_id
       WHERE c.case_id = ? AND c.deleted_at IS NULL LIMIT 1`,
      [caseId]
    );

    if (caseRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Case not found"
      });
    }

    // Get assigned officers
    const [officers] = await db.query(
      `SELECT u.user_id, u.full_name, u.username, ca.assigned_at
       FROM case_assignments ca
       JOIN users u ON ca.user_id = u.user_id
       WHERE ca.case_id = ?`,
      [caseId]
    );

    // Get linked criminals
    const [criminals] = await db.query(
      `SELECT cp.*
       FROM case_criminals cc
       JOIN criminal_profiles cp ON cc.criminal_id = cp.criminal_id
       WHERE cc.case_id = ?`,
      [caseId]
    );

    await res.audit(
      AUDIT_ACTIONS.CASE_VIEWED,
      AUDIT_RESOURCE_TYPES.CASE,
      caseId,
      { viewedBy: req.user.id }
    );

    return res.status(200).json({
      success: true,
      case: {
        ...caseRows[0],
        assigned_officers: officers,
        linked_criminals: criminals
      }
    });

  } catch (error) {
    next(error);
  }
};

// ─── CREATE CASE — admin, stf only ───────────────────────
const createCase = async (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Case title is required"
      });
    }

    const validStatuses  = ["open", "under_investigation", "closed"];
    const validPriority  = ["low", "medium", "high"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be: ${validStatuses.join(", ")}`
      });
    }

    if (priority && !validPriority.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priority must be: ${validPriority.join(", ")}`
      });
    }

    const [result] = await db.query(
      `INSERT INTO cases (title, description, status, priority, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        status    || "open",
        priority  || "medium",
        req.user.id
      ]
    );

    await res.audit(
      AUDIT_ACTIONS.CASE_CREATED,
      AUDIT_RESOURCE_TYPES.CASE,
      result.insertId,
      { createdBy: req.user.id, title }
    );

    return res.status(201).json({
      success: true,
      message: "Case created successfully",
      caseId: result.insertId
    });

  } catch (error) {
    next(error);
  }
};

// ─── UPDATE CASE ─────────────────────────────────────────
// requireCaseAccess already verified access
const updateCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { title, description, status, priority } = req.body;

    const [before] = await db.query(
      "SELECT * FROM cases WHERE case_id = ? LIMIT 1",
      [caseId]
    );

    if (before.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Case not found"
      });
    }

    await db.query(
      `UPDATE cases SET
        title       = COALESCE(?, title),
        description = COALESCE(?, description),
        status      = COALESCE(?, status),
        priority    = COALESCE(?, priority)
       WHERE case_id = ?`,
      [title || null, description || null, status || null, priority || null, caseId]
    );

    const [after] = await db.query(
      "SELECT * FROM cases WHERE case_id = ? LIMIT 1",
      [caseId]
    );

    await res.auditWithChanges(
      AUDIT_ACTIONS.CASE_UPDATED,
      AUDIT_RESOURCE_TYPES.CASE,
      caseId,
      before[0],
      after[0]
    );

    return res.status(200).json({
      success: true,
      message: "Case updated successfully",
      case: after[0]
    });

  } catch (error) {
    next(error);
  }
};

// ─── DELETE CASE — admin only (soft delete) ───────────────
const deleteCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const [existing] = await db.query(
      "SELECT case_id, title FROM cases WHERE case_id = ? AND deleted_at IS NULL LIMIT 1",
      [caseId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Case not found"
      });
    }

    // Soft delete — keep data, just hide it
    await db.query(
      "UPDATE cases SET deleted_at = NOW() WHERE case_id = ?",
      [caseId]
    );

    await res.audit(
      AUDIT_ACTIONS.CASE_DELETED,
      AUDIT_RESOURCE_TYPES.CASE,
      caseId,
      { deletedBy: req.user.id, title: existing[0].title }
    );

    return res.status(200).json({
      success: true,
      message: "Case deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};

// ─── CLOSE CASE — admin, stf only ────────────────────────
const closeCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    await db.query(
      "UPDATE cases SET status = 'closed' WHERE case_id = ?",
      [caseId]
    );

    await res.audit(
      AUDIT_ACTIONS.CASE_CLOSED,
      AUDIT_RESOURCE_TYPES.CASE,
      caseId,
      { closedBy: req.user.id }
    );

    return res.status(200).json({
      success: true,
      message: "Case closed successfully"
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getAllCases, getCaseById, createCase, updateCase, deleteCase, closeCase };
