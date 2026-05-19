const db = require("../config/db");
const path = require("path");
const fs = require("fs");
const { AUDIT_ACTIONS, AUDIT_RESOURCE_TYPES } = require("../middleware/auditAfterSuccess");

// ─── GET EVIDENCE FOR A CASE ──────────────────────────────
// requireCaseAccess already verified access
const getEvidenceByCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const [rows] = await db.query(
      `SELECT e.*, u.full_name AS uploaded_by_name
       FROM evidence e
       LEFT JOIN users u ON e.uploaded_by = u.user_id
       WHERE e.case_id = ?
       ORDER BY e.uploaded_at DESC`,
      [caseId]
    );

    await res.audit(
      AUDIT_ACTIONS.FILE_DOWNLOADED,
      AUDIT_RESOURCE_TYPES.EVIDENCE,
      caseId,
      { viewedBy: req.user.id, count: rows.length }
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      evidence: rows
    });

  } catch (error) {
    next(error);
  }
};

// ─── UPLOAD EVIDENCE ─────────────────────────────────────
// upload.js middleware handles file storage before this runs
// req.files populated by multer from upload.js
const uploadEvidence = async (req, res, next) => {
  try {
    const { case_id, report_id } = req.body;

    if (!case_id) {
      return res.status(400).json({
        success: false,
        message: "case_id is required"
      });
    }

    // Check case exists
    const [caseRows] = await db.query(
      "SELECT case_id FROM cases WHERE case_id = ? AND deleted_at IS NULL LIMIT 1",
      [case_id]
    );

    if (caseRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Case not found"
      });
    }

    // Get files from upload.js multer
    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    if (!imageFile && !videoFile) {
      return res.status(400).json({
        success: false,
        message: "At least one image or video file is required"
      });
    }

    const imagePath = imageFile ? imageFile.path : null;
    const videoPath = videoFile ? videoFile.path : null;

    const [result] = await db.query(
      `INSERT INTO evidence (case_id, report_id, image_path, video_path, uploaded_by)
       VALUES (?, ?, ?, ?, ?)`,
      [case_id, report_id || null, imagePath, videoPath, req.user.id]
    );

    await res.audit(
      AUDIT_ACTIONS.FILE_UPLOADED,
      AUDIT_RESOURCE_TYPES.EVIDENCE,
      result.insertId,
      {
        uploadedBy: req.user.id,
        caseId: case_id,
        imagePath,
        videoPath
      }
    );

    return res.status(201).json({
      success: true,
      message: "Evidence uploaded successfully",
      evidenceId: result.insertId,
      files: {
        image: imagePath,
        video: videoPath
      }
    });

  } catch (error) {
    next(error);
  }
};

// ─── DOWNLOAD / VIEW EVIDENCE ─────────────────────────────
const downloadEvidence = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM evidence WHERE evidence_id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Evidence not found"
      });
    }

    const evidence = rows[0];
    const filePath = evidence.image_path || evidence.video_path;

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Evidence file not found on server"
      });
    }

    await res.audit(
      AUDIT_ACTIONS.FILE_DOWNLOADED,
      AUDIT_RESOURCE_TYPES.EVIDENCE,
      id,
      { downloadedBy: req.user.id, filePath }
    );

    return res.download(filePath);

  } catch (error) {
    next(error);
  }
};

// ─── DELETE EVIDENCE — admin only ────────────────────────
const deleteEvidence = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM evidence WHERE evidence_id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Evidence not found"
      });
    }

    const evidence = rows[0];

    // Delete actual files from disk
    if (evidence.image_path && fs.existsSync(evidence.image_path)) {
      fs.unlinkSync(evidence.image_path);
    }
    if (evidence.video_path && fs.existsSync(evidence.video_path)) {
      fs.unlinkSync(evidence.video_path);
    }

    await db.query("DELETE FROM evidence WHERE evidence_id = ?", [id]);

    await res.audit(
      AUDIT_ACTIONS.FILE_DELETED,
      AUDIT_RESOURCE_TYPES.EVIDENCE,
      id,
      { deletedBy: req.user.id, caseId: evidence.case_id }
    );

    return res.status(200).json({
      success: true,
      message: "Evidence deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getEvidenceByCase, uploadEvidence, downloadEvidence, deleteEvidence };
