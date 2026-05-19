const db = require("../config/db");
const { AUDIT_ACTIONS, AUDIT_RESOURCE_TYPES } = require("../middleware/auditAfterSuccess");

// ─── GET ALL ASSIGNMENTS — admin, stf ────────────────────
const getAllAssignments = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT ca.*, 
        c.title AS case_title, c.status AS case_status,
        u.full_name AS officer_name, u.username AS officer_username
       FROM case_assignments ca
       JOIN cases c ON ca.case_id = c.case_id
       JOIN users u ON ca.user_id = u.user_id
       WHERE c.deleted_at IS NULL
       ORDER BY ca.assigned_at DESC`
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      assignments: rows
    });

  } catch (error) {
    next(error);
  }
};

// ─── GET MY ASSIGNMENTS — officer ────────────────────────
const getMyAssignments = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT ca.*,
        c.title AS case_title, c.status AS case_status,
        c.priority, c.description
       FROM case_assignments ca
       JOIN cases c ON ca.case_id = c.case_id
       WHERE ca.user_id = ? AND c.deleted_at IS NULL
       ORDER BY ca.assigned_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      assignments: rows
    });

  } catch (error) {
    next(error);
  }
};

// ─── ASSIGN OFFICER TO CASE — admin only ─────────────────
const assignOfficer = async (req, res, next) => {
  try {
    const { case_id, user_id } = req.body;

    if (!case_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "case_id and user_id are required"
      });
    }

    // Check case exists
    const [caseRows] = await db.query(
      "SELECT case_id, title FROM cases WHERE case_id = ? AND deleted_at IS NULL LIMIT 1",
      [case_id]
    );

    if (caseRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Case not found"
      });
    }

    // Check user is an officer or stf
    const [userRows] = await db.query(
      "SELECT user_id, full_name, role FROM users WHERE user_id = ? AND status = 'active' LIMIT 1",
      [user_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Officer not found or inactive"
      });
    }

    if (!["officer", "stf"].includes(userRows[0].role)) {
      return res.status(400).json({
        success: false,
        message: "User must be an officer or stf to be assigned"
      });
    }

    // Check already assigned
    const [existing] = await db.query(
      "SELECT assignment_id FROM case_assignments WHERE case_id = ? AND user_id = ? LIMIT 1",
      [case_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Officer is already assigned to this case"
      });
    }

    const [result] = await db.query(
      "INSERT INTO case_assignments (case_id, user_id) VALUES (?, ?)",
      [case_id, user_id]
    );

    await res.audit(
      AUDIT_ACTIONS.ASSIGNMENT_CREATED,
      AUDIT_RESOURCE_TYPES.ASSIGNMENT,
      result.insertId,
      {
        assignedBy: req.user.id,
        caseId: case_id,
        caseTitle: caseRows[0].title,
        officerId: user_id,
        officerName: userRows[0].full_name
      }
    );

    return res.status(201).json({
      success: true,
      message: `${userRows[0].full_name} assigned to case successfully`,
      assignmentId: result.insertId
    });

  } catch (error) {
    next(error);
  }
};

// ─── REMOVE ASSIGNMENT — admin only ──────────────────────
const removeAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      `SELECT ca.*, u.full_name, c.title AS case_title
       FROM case_assignments ca
       JOIN users u ON ca.user_id = u.user_id
       JOIN cases c ON ca.case_id = c.case_id
       WHERE ca.assignment_id = ? LIMIT 1`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }

    await db.query(
      "DELETE FROM case_assignments WHERE assignment_id = ?",
      [id]
    );

    await res.audit(
      AUDIT_ACTIONS.ASSIGNMENT_UPDATED,
      AUDIT_RESOURCE_TYPES.ASSIGNMENT,
      id,
      {
        removedBy: req.user.id,
        officerName: existing[0].full_name,
        caseTitle: existing[0].case_title
      }
    );

    return res.status(200).json({
      success: true,
      message: "Assignment removed successfully"
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getAllAssignments, getMyAssignments, assignOfficer, removeAssignment };
