const db = require("../config/db");

const auditAfterSuccess = (req, res, next) => {

  // ✅ Simple audit log — writes to DB
  res.audit = async (action, resourceType, resourceId, details = {}) => {
    try {
      const userId = req.user?.id || null;
      const ip = req.ip || req.headers["x-forwarded-for"] || "SYSTEM";

      await db.query(
        `INSERT INTO access_logs 
          (user_id, action, target_table, target_id, details, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, action, resourceType, resourceId,
         JSON.stringify(details), ip]
      );

      console.log('[AUDIT LOG]', action, resourceType, resourceId);
      return true;
    } catch (auditError) {
      console.error('Failed to log audit:', auditError.message);
      return false;
    }
  };

  // ✅ Audit with change tracking (before & after values)
  res.auditWithChanges = async (action, resourceType, resourceId, beforeData, afterData) => {
    try {
      const changes = {};
      for (const key in afterData) {
        if (JSON.stringify(beforeData[key]) !== JSON.stringify(afterData[key])) {
          changes[key] = { 
            before: beforeData[key], 
            after: afterData[key] 
          };
        }
      }

      const userId = req.user?.id || null;
      const ip = req.ip || req.headers["x-forwarded-for"] || "SYSTEM";

      await db.query(
        `INSERT INTO access_logs 
          (user_id, action, target_table, target_id, details, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, action, resourceType, resourceId,
         JSON.stringify({ changes, changesCount: Object.keys(changes).length }), ip]
      );

      console.log('[AUDIT LOG - CHANGES]', action, resourceType, resourceId);
      return true;
    } catch (auditError) {
      console.error('Failed to log audit with changes:', auditError.message);
      return false;
    }
  };

  // ✅ Bulk audit log
  res.auditBulk = async (action, resourceType, affectedCount, details = {}) => {
    try {
      const userId = req.user?.id || null;
      const ip = req.ip || req.headers["x-forwarded-for"] || "SYSTEM";

      await db.query(
        `INSERT INTO access_logs 
          (user_id, action, target_table, target_id, details, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, action, resourceType, null,
         JSON.stringify({ affectedCount, ...details }), ip]
      );

      console.log('[AUDIT LOG - BULK]', action, resourceType, affectedCount);
      return true;
    } catch (auditError) {
      console.error('Failed to log bulk audit:', auditError.message);
      return false;
    }
  };

  next();
};

// ✅ Predefined action constants
const AUDIT_ACTIONS = {
  CASE_CREATED: 'CASE_CREATED',
  CASE_UPDATED: 'CASE_UPDATED',
  CASE_DELETED: 'CASE_DELETED',
  CASE_VIEWED: 'CASE_VIEWED',
  CASE_ASSIGNED: 'CASE_ASSIGNED',
  CASE_APPROVED: 'CASE_APPROVED',
  CASE_REJECTED: 'CASE_REJECTED',
  CASE_CLOSED: 'CASE_CLOSED',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
  USER_PASSWORD_CHANGED: 'USER_PASSWORD_CHANGED',
  FILE_UPLOADED: 'FILE_UPLOADED',
  FILE_DOWNLOADED: 'FILE_DOWNLOADED',
  FILE_DELETED: 'FILE_DELETED',
  ASSIGNMENT_CREATED: 'ASSIGNMENT_CREATED',
  ASSIGNMENT_UPDATED: 'ASSIGNMENT_UPDATED',
  ASSIGNMENT_COMPLETED: 'ASSIGNMENT_COMPLETED',
  APPROVAL_REQUESTED: 'APPROVAL_REQUESTED',
  APPROVAL_APPROVED: 'APPROVAL_APPROVED',
  APPROVAL_REJECTED: 'APPROVAL_REJECTED',
  ROLE_CHANGED: 'ROLE_CHANGED',
  PERMISSION_CHANGED: 'PERMISSION_CHANGED',
};

// ✅ Predefined resource type constants
const AUDIT_RESOURCE_TYPES = {
  CASE: 'case',
  USER: 'user',
  ASSIGNMENT: 'assignment',
  APPROVAL: 'approval',
  FILE: 'file',
  CASE_NOTE: 'case_note',
  EVIDENCE: 'evidence',
};

module.exports = { auditAfterSuccess, AUDIT_ACTIONS, AUDIT_RESOURCE_TYPES };