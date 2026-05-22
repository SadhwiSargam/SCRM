// ─── USER ROLES ───────────────────────────────────────────
const ROLES = {
  ADMIN:   "admin",
  OFFICER: "officer",
  STF:     "stf",
  PUBLIC:  "public",
};

// ─── USER STATUS ──────────────────────────────────────────
const USER_STATUS = {
  ACTIVE:    "active",
  SUSPENDED: "suspended",
};

// ─── CASE STATUS ──────────────────────────────────────────
const CASE_STATUS = {
  OPEN:                "open",
  UNDER_INVESTIGATION: "under_investigation",
  CLOSED:              "closed",
};

// ─── CASE PRIORITY ────────────────────────────────────────
const CASE_PRIORITY = {
  LOW:    "low",
  MEDIUM: "medium",
  HIGH:   "high",
};

// ─── CHANGE REQUEST ACTIONS ───────────────────────────────
const REQUEST_ACTIONS = {
  INSERT: "INSERT",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

// ─── CHANGE REQUEST STATUS ────────────────────────────────
const REQUEST_STATUS = {
  PENDING:  "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// ─── APPROVAL DECISIONS ───────────────────────────────────
const APPROVAL_DECISIONS = {
  APPROVED: "approved",
  REJECTED: "rejected",
};

// ─── REPORT STATUS ────────────────────────────────────────
const REPORT_STATUS = {
  PENDING:  "pending",
  REVIEWED: "reviewed",
  CLOSED:   "closed",
};

// ─── CRIMINAL RISK LEVEL ──────────────────────────────────
const RISK_LEVEL = {
  LOW:      "low",
  MEDIUM:   "medium",
  HIGH:     "high",
  CRITICAL: "critical",
};

// ─── CRIMINAL STATUS ──────────────────────────────────────
const CRIMINAL_STATUS = {
  ACTIVE:   "active",
  INACTIVE: "inactive",
  ARRESTED: "arrested",
};

// ─── PAGINATION DEFAULTS ──────────────────────────────────
const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT:     100,
};

// ─── JWT ──────────────────────────────────────────────────
const JWT = {
  EXPIRES_IN: "8h",
};

// ─── BCRYPT ───────────────────────────────────────────────
const BCRYPT = {
  SALT_ROUNDS: 12,
};

// ─── PASSWORD RULES ───────────────────────────────────────
const PASSWORD = {
  MIN_LENGTH: 8,
};

// ─── REPORT RULES ─────────────────────────────────────────
const REPORT = {
  MIN_TEXT_LENGTH: 20,
};

// ─── RATE LIMITER ─────────────────────────────────────────
const RATE_LIMIT = {
  WINDOW_MS:   15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
};

// ─── AUDIT LOG LIMITS ─────────────────────────────────────
const AUDIT = {
  USER_LOG_LIMIT:            100,
  PUBLIC_CASES_LIMIT:         20,
  SUSPICIOUS_DENIED_COUNT:     3,   // flag user after this many ACCESS_DENIED
  SUSPICIOUS_IP_COUNT:         5,   // flag IP after this many failed attempts
  SUSPICIOUS_WINDOW_HOURS:     1,   // hours to look back for suspicious IPs
  SUSPICIOUS_USER_WINDOW_HOURS: 24, // hours to look back for suspicious users
  MOST_ACTIVE_USERS_LIMIT:     5,
  SUMMARY_WINDOW_DAYS:         7,
};

// ─── FILE UPLOAD PATHS ────────────────────────────────────
const UPLOAD_PATHS = {
  IMAGES: "uploads/images",
  VIDEOS: "uploads/videos",
  OTHERS: "uploads/others",
};

// ─── ASSIGNABLE ROLES ─────────────────────────────────────
// Only these roles can be assigned to a case
const ASSIGNABLE_ROLES = [ROLES.OFFICER, ROLES.STF];

module.exports = {
  ROLES,
  USER_STATUS,
  CASE_STATUS,
  CASE_PRIORITY,
  REQUEST_ACTIONS,
  REQUEST_STATUS,
  APPROVAL_DECISIONS,
  REPORT_STATUS,
  RISK_LEVEL,
  CRIMINAL_STATUS,
  PAGINATION,
  JWT,
  BCRYPT,
  PASSWORD,
  REPORT,
  RATE_LIMIT,
  AUDIT,
  UPLOAD_PATHS,
  ASSIGNABLE_ROLES,
};