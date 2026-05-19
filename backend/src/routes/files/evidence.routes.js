const express = require("express");
const router = express.Router();

const {
  getEvidenceByCase,
  uploadEvidence,
  downloadEvidence,
  deleteEvidence,
} = require("../controllers/evidence.controller");

const authenticate          = require("../middleware/authenticate");
const authorizeRoles        = require("../middleware/authorizeRoles");
const requireCaseAccess     = require("../middleware/requireCaseAccess");
const { auditAfterSuccess } = require("../middleware/auditAfterSuccess");
const upload                = require("../middleware/upload");

// All routes require login + audit
router.use(authenticate, auditAfterSuccess);

// GET  /api/evidence/case/:caseId  — admin, stf, officer (must be assigned)
router.get(
  "/case/:caseId",
  authorizeRoles("admin", "stf", "officer"),
  requireCaseAccess,
  getEvidenceByCase
);

// POST /api/evidence/upload        — admin, stf, officer (must be assigned)
// upload.js multer handles image + video fields
router.post(
  "/upload",
  authorizeRoles("admin", "stf", "officer"),
  requireCaseAccess,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  uploadEvidence
);

// GET  /api/evidence/:id/download  — admin, stf, officer
router.get(
  "/:id/download",
  authorizeRoles("admin", "stf", "officer"),
  downloadEvidence
);

// DELETE /api/evidence/:id         — admin only
router.delete(
  "/:id",
  authorizeRoles("admin"),
  deleteEvidence
);

module.exports = router;
