const db = require("../config/db");
const { auditLog } = require("../services/audit.service");

const requireCaseAccess = async (req, res, next) => {
  try {
    const caseId = req.params.caseId || req.body.case_id;

    if (!caseId) {
      return res.status(400).json({ 
        success: false, 
        message: "caseId is required" 
      });
    }

    // admin and stf can access all cases
    if (req.user.role === "admin" || req.user.role === "stf") {
      return next();
    }

    // officer can only access assigned cases
    if (req.user.role === "officer") {
      const [rows] = await db.query(
        `SELECT ca.assignment_id 
         FROM case_assignments ca
         JOIN cases c ON c.case_id = ca.case_id
         WHERE ca.case_id = ? AND ca.user_id = ?
         AND c.deleted_at IS NULL
         LIMIT 1`,
        [caseId, req.user.id]
      );

      if (rows.length > 0) return next();
    }

    // log denied access
    await auditLog(req, {
      action: "ACCESS_DENIED",
      targetTable: "cases",
      targetId: caseId,
      details: "User tried to access unassigned or forbidden case",
    });

    return res.status(403).json({ 
      success: false, 
      message: "You are not assigned to this case" 
    });

  } catch (error) {
    next(error);
  }
};

module.exports = requireCaseAccess;