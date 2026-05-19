const db = require("../config/db");

// ─── GET ALL AUDIT LOGS — admin only ─────────────────────
const getAllLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, user_id, from_date, to_date } = req.query;
    const offset = (page - 1) * limit;

    let conditions = [];
    let params = [];

    if (action) {
      conditions.push("al.action = ?");
      params.push(action);
    }

    if (user_id) {
      conditions.push("al.user_id = ?");
      params.push(user_id);
    }

    if (from_date) {
      conditions.push("al.timestamp >= ?");
      params.push(from_date);
    }

    if (to_date) {
      conditions.push("al.timestamp <= ?");
      params.push(to_date);
    }

    const whereClause = conditions.length > 0
      ? "WHERE " + conditions.join(" AND ")
      : "";

    const [rows] = await db.query(
      `SELECT al.*, u.full_name, u.username, u.role
       FROM access_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       ${whereClause}
       ORDER BY al.timestamp DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM access_logs al ${whereClause}`,
      params
    );

    return res.status(200).json({
      success: true,
      total: countRows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      logs: rows
    });

  } catch (error) {
    next(error);
  }
};

// ─── GET LOGS FOR SPECIFIC USER — admin only ──────────────
const getUserLogs = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      `SELECT al.*, u.full_name, u.username
       FROM access_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       WHERE al.user_id = ?
       ORDER BY al.timestamp DESC
       LIMIT 100`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      logs: rows
    });

  } catch (error) {
    next(error);
  }
};

// ─── GET LOGS FOR SPECIFIC CASE — admin only ─────────────
const getCaseLogs = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const [rows] = await db.query(
      `SELECT al.*, u.full_name, u.username, u.role
       FROM access_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       WHERE al.target_table = 'cases' AND al.target_id = ?
       ORDER BY al.timestamp DESC`,
      [caseId]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      logs: rows
    });

  } catch (error) {
    next(error);
  }
};

// ─── GET SUSPICIOUS ACTIVITY — admin only ─────────────────
const getSuspiciousActivity = async (req, res, next) => {
  try {
    // Find users with ACCESS_DENIED more than 3 times
    const [denied] = await db.query(
      `SELECT al.user_id, u.full_name, u.username,
        COUNT(*) AS denied_count,
        MAX(al.timestamp) AS last_attempt
       FROM access_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       WHERE al.action = 'ACCESS_DENIED'
       AND al.timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       GROUP BY al.user_id
       HAVING denied_count >= 3
       ORDER BY denied_count DESC`
    );

    // Find IPs with multiple failed attempts
    const [suspiciousIPs] = await db.query(
      `SELECT ip_address, COUNT(*) AS attempt_count,
        MAX(timestamp) AS last_attempt
       FROM access_logs
       WHERE action = 'ACCESS_DENIED'
       AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
       GROUP BY ip_address
       HAVING attempt_count >= 5
       ORDER BY attempt_count DESC`
    );

    return res.status(200).json({
      success: true,
      suspicious_users: denied,
      suspicious_ips: suspiciousIPs
    });

  } catch (error) {
    next(error);
  }
};

// ─── GET AUDIT SUMMARY — admin dashboard ─────────────────
const getAuditSummary = async (req, res, next) => {
  try {
    // Total actions today
    const [todayCount] = await db.query(
      `SELECT COUNT(*) AS total
       FROM access_logs
       WHERE DATE(timestamp) = CURDATE()`
    );

    // Actions by type
    const [byAction] = await db.query(
      `SELECT action, COUNT(*) AS count
       FROM access_logs
       WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY action
       ORDER BY count DESC`
    );

    // Most active users
    const [activeUsers] = await db.query(
      `SELECT al.user_id, u.full_name, u.role, COUNT(*) AS action_count
       FROM access_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       WHERE al.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY al.user_id
       ORDER BY action_count DESC
       LIMIT 5`
    );

    return res.status(200).json({
      success: true,
      summary: {
        today_total: todayCount[0].total,
        by_action:   byAction,
        most_active_users: activeUsers
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getAllLogs, getUserLogs, getCaseLogs, getSuspiciousActivity, getAuditSummary };
