import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  getGoogleDriveAuthMode,
  isGoogleDriveConfigured,
  uploadPdfToGoogleDrive,
} from "@/lib/google-drive";
import { pdfRenderTimeoutMs, skipGoogleDriveUpload } from "@/lib/runtime-limits";

export const MANUAL_PDF_RENDER_TIMEOUT_MS = pdfRenderTimeoutMs();
export const AI_PDF_RENDER_TIMEOUT_MS = pdfRenderTimeoutMs({ ai: true });

export async function renderPdfBuffer(TemplateComponent, templateData, timeoutMs = MANUAL_PDF_RENDER_TIMEOUT_MS) {
  const doc = React.createElement(TemplateComponent, { data: templateData });

  let timeoutId;
  const pdfBuffer = await Promise.race([
    renderToBuffer(doc),
    new Promise((_, reject) => {
      timeoutId = setTimeout(
        () =>
          reject(
            new Error(
              "PDF rendering timed out. Try fewer/shorter bullets per job, or restart with: npm run clean && npm run dev"
            )
          ),
        timeoutMs
      );
    }),
  ]).finally(() => clearTimeout(timeoutId));

  if (!pdfBuffer?.length || pdfBuffer.length < 100) {
    throw new Error("PDF rendering produced an empty file");
  }
  if (!pdfBuffer.subarray(0, 4).toString("utf8").startsWith("%PDF")) {
    throw new Error("PDF rendering failed: invalid document output");
  }

  return pdfBuffer;
}

export function sendPdfResponse(res, pdfBuffer, fileName, { driveUrl = null, driveError = null } = {}) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", String(pdfBuffer.length));
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Cache-Control", "no-store");
  if (driveUrl) {
    res.setHeader("X-Google-Drive-Url", driveUrl);
  }
  if (driveError) {
    res.setHeader("X-Google-Drive-Error", driveError.slice(0, 1500));
  }
  res.status(200).send(pdfBuffer);
}

/** Render PDF to client and upload a copy to Google Drive when configured. */
export async function sendPdfResponseWithDrive(res, pdfBuffer, fileName, { profileName } = {}) {
  let driveUrl = null;
  let driveError = null;

  if (skipGoogleDriveUpload()) {
    sendPdfResponse(res, pdfBuffer, fileName);
    return;
  }

  const driveMode = getGoogleDriveAuthMode();
  if (driveMode === "oauth_pending" && process.env.GOOGLE_DRIVE_FOLDER_ID?.trim()) {
    driveError =
      "Google Drive not connected. Open /api/google-drive/auth in your browser, sign in with Gmail, and add GOOGLE_OAUTH_REFRESH_TOKEN to .env.";
  } else if (isGoogleDriveConfigured()) {
    try {
      const uploaded = await uploadPdfToGoogleDrive(pdfBuffer, fileName, { profileName });
      driveUrl = uploaded.url;
      console.log(
        `[google-drive] uploaded ${uploaded.drivePath ? `${uploaded.drivePath}/` : ""}${fileName} -> ${driveUrl}`
      );
    } catch (err) {
      driveError = err?.message || "Google Drive upload failed";
      console.error("[google-drive] upload failed:", err);
    }
  }

  sendPdfResponse(res, pdfBuffer, fileName, { driveUrl, driveError });
}

function filenameSegment(value) {
  if (!value || !String(value).trim()) return "";
  return String(value).trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_-]/g, "");
}

export function pdfAttachmentFilename(resumeName, companyName, roleName) {
  const nameParts = resumeName ? resumeName.trim().split(/\s+/) : [];
  let base =
    !nameParts.length ? "resume" : nameParts.length === 1 ? nameParts[0] : `${nameParts[0]}_${nameParts[nameParts.length - 1]}`;
  base = base.replace(/\s+/g, "_").replace(/[^A-Za-z0-9_-]/g, "");

  const company = filenameSegment(companyName);
  const role = filenameSegment(roleName);
  if (company) base = `${base}_${company}`;
  if (role) base = `${base}_${role}`;

  return `${base}.pdf`;
}
