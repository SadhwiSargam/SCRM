const express = require("express");
const app = express();

// ─── CORE MIDDLEWARE ──────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ───────────────────────────────────────────────
const authRoutes        = require("./routes/auth.routes");
const usersRoutes       = require("./routes/users.routes");
const casesRoutes       = require("./routes/cases.routes");
const evidenceRoutes    = require("./routes/evidence.routes");
const assignmentsRoutes = require("./routes/assignments.routes");
const approvalsRoutes   = require("./routes/approvals.routes");
const auditRoutes       = require("./routes/audit.routes");
const publicRoutes      = require("./routes/public.routes");

app.use("/api/auth",        authRoutes);
app.use("/api/users",       usersRoutes);
app.use("/api/cases",       casesRoutes);
app.use("/api/evidence",    evidenceRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/approvals",   approvalsRoutes);
app.use("/api/audit",       auditRoutes);
app.use("/api/public",      publicRoutes);

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

module.exports = app;
