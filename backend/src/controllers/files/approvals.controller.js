const db = require("../config/db");
const { AUDIT_ACTIONS, AUDIT_RESOURCE_TYPES } = require("../middleware/auditAfterSuccess");

// ─── GET ALL CHANGE REQUESTS — admin only ─────────────────
const getAllRequests = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT cr.*, u.full_name AS requested_by_name
       FROM change_requests cr
       LEFT JOIN users u ON cr.requested_by = u.user_id
       ORDER BY cr.created_at DESC`
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      requests: rows
    });

  } catch (error) {
    next(error);
  }
};

// ─── CREATE CHANGE REQUEST — officer, stf ─────────────────
const createRequest = async (req, res, next) => {
  try {
    const { table_name, record_id, action } = req.body;

    if (!table_name || !record_id || !action) {
      return res.status(400).json({
        success: false,
        message: "table_name, record_id and action are required"
      });
    }

    const validActions = ["INSERT", "UPDATE", "DELETE"];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: `Action must be: ${validActions.join(", ")}`
      });
    }

    const [result] = await db.query(
      `INSERT INTO change_requests (table_name, record_id, action, requested_by, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [table_name, record_id, action, req.user.id]
    );

    await res.audit(
      AUDIT_ACTIONS.APPROVAL_REQUESTED,
      AUDIT_RESOURCE_TYPES.APPROVAL,
      result.insertId,
      { requestedBy: req.user.id, table_name, record_id, action }
    );

    return res.status(201).json({
      success: true,
      message: "Change request submitted. Awaiting admin approval.",
      requestId: result.insertId
    });

  } catch (error) {
    next(error);
  }
};

// ─── APPROVE REQUEST — admin only ────────────────────────
const approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const [reqRows] = await db.query(
      "SELECT * FROM change_requests WHERE request_id = ? LIMIT 1",
      [id]
    );

    if (reqRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Change request not found"
      });
    }

    if (reqRows[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request already ${reqRows[0].status}`
      });
    }

    // Update request status
    await db.query(
      "UPDATE change_requests SET status = 'approved' WHERE request_id = ?",
      [id]
    );

    // Insert into approvals table
    await db.query(
      `INSERT INTO approvals (request_id, approved_by, decision, comment)
       VALUES (?, ?, 'approved', ?)`,
      [id, req.user.id, comment || null]
    );

    await res.audit(
      AUDIT_ACTIONS.APPROVAL_APPROVED,
      AUDIT_RESOURCE_TYPES.APPROVAL,
      id,
      { approvedBy: req.user.id, requestId: id, comment }
    );

    return res.status(200).json({
      success: true,
      message: "Change request approved successfully"
    });

  } catch (error) {
    next(error);
  }
};

// ─── REJECT REQUEST — admin only ─────────────────────────
const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Rejection comment/reason is required"
      });
    }

    const [reqRows] = await db.query(
      "SELECT * FROM change_requests WHERE request_id = ? LIMIT 1",
      [id]
    );

    if (reqRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Change request not found"
      });
    }

    if (reqRows[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request already ${reqRows[0].status}`
      });
    }

    await db.query(
      "UPDATE change_requests SET status = 'rejected' WHERE request_id = ?",
      [id]
    );

    await db.query(
      `INSERT INTO approvals (request_id, approved_by, decision, comment)
       VALUES (?, ?, 'rejected', ?)`,
      [id, req.user.id, comment]
    );

    await res.audit(
      AUDIT_ACTIONS.APPROVAL_REJECTED,
      AUDIT_RESOURCE_TYPES.APPROVAL,
      id,
      { rejectedBy: req.user.id, requestId: id, comment }
    );

    return res.status(200).json({
      success: true,
      message: "Change request rejected"
    });

  } catch (error) {
    next(error);
  }
};

// ─── GET ALL APPROVALS — admin only ──────────────────────
const getAllApprovals = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, u.full_name AS approved_by_name,
        cr.table_name, cr.record_id, cr.action AS request_action
       FROM approvals a
       LEFT JOIN users u ON a.approved_by = u.user_id
       LEFT JOIN change_requests cr ON a.request_id = cr.request_id
       ORDER BY a.approved_at DESC`
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      approvals: rows
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRequests, createRequest, approveRequest, rejectRequest, getAllApprovals };
