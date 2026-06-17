/**
 * Vercel Fluid CPU is billed for active serverless time. PDF + AI routes are expensive.
 * Defaults keep Vercel usage low; set env vars to re-enable features when needed.
 */

export function isVercelDeployment() {
  return process.env.VERCEL === "1";
}

/** AI + multi-retry generation (/api/generate). Off on Vercel unless ENABLE_VERCEL_AI=1 */
export function isAiGenerateEnabled() {
  if (!isVercelDeployment()) return true;
  return process.env.ENABLE_VERCEL_AI === "1";
}

/** Template preview PDF (/api/preview). Off on Vercel unless ENABLE_VERCEL_PREVIEW=1 */
export function isPreviewEnabled() {
  if (!isVercelDeployment()) return true;
  return process.env.ENABLE_VERCEL_PREVIEW === "1";
}

/** Manual JSON → PDF (/api/generate-manual). Off on Vercel unless ENABLE_VERCEL_MANUAL_PDF=1 */
export function isManualPdfEnabled() {
  if (!isVercelDeployment()) return true;
  return process.env.ENABLE_VERCEL_MANUAL_PDF === "1";
}

export function skipGoogleDriveUpload() {
  if (!isVercelDeployment()) return false;
  return process.env.ENABLE_VERCEL_DRIVE !== "1";
}

export function aiCallRetries() {
  return isVercelDeployment() ? 0 : 2;
}

/** Max AI attempts in /api/generate (full → concise → repair). */
export function aiGenerateMaxAttempts() {
  return isVercelDeployment() ? 1 : 3;
}

export function aiCallTimeoutMs() {
  return isVercelDeployment() ? 90_000 : 180_000;
}

export function pdfRenderTimeoutMs({ ai = false } = {}) {
  if (!isVercelDeployment()) {
    return ai ? 120_000 : 180_000;
  }
  return 45_000;
}

export function heavyApiDisabledMessage(feature) {
  return (
    `${feature} is disabled on this Vercel deployment to reduce Fluid CPU usage. ` +
    `Run locally with npm run dev, or set the appropriate ENABLE_VERCEL_* env var in Vercel project settings.`
  );
}
