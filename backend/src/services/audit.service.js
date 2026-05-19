const db = require("../config/db");

const auditLog = async (req, { action, targetTable, targetId, details }) => {
  try {
    const userId = req.user?.id || null;
    const ip = req.ip || req.headers["x-forwarded-for"] || "SYSTEM";

    await db.query(
      `INSERT INTO access_logs 
        (user_id, action, target_table, target_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, action, targetTable, targetId, details, ip]
    );
  } catch (err) {
    console.error("[AUDIT ERROR]", err.message);
  }
};

module.exports = { auditLog };