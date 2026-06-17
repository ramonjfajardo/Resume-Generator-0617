import { Readable } from "stream";
import { google } from "googleapis";
import {
  getOAuthPublishingMode,
  getOAuthRenewalInfo,
  isOAuthTestingMode,
  resolveOAuthRefreshToken,
  TESTING_REFRESH_TOKEN_LIFETIME_DAYS,
} from "@/lib/google-oauth-store";

/** Full Drive access — upload PDFs to a My Drive folder you own. */
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";

const CONNECT_HINT =
  "Connect personal Gmail: set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET, " +
  "then open /api/google-drive/auth once (token is saved to data/.google-oauth-token.json).";

function getRedirectUri() {
  return (
    process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() ||
    "http://localhost:3000/api/google-drive/callback"
  );
}

export function createOAuth2Client() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET are required.");
  }
  return new google.auth.OAuth2(clientId, clientSecret, getRedirectUri());
}

export function hasOAuthClientCredentials() {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() && process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim()
  );
}

export function isOAuthConnected() {
  return Boolean(hasOAuthClientCredentials() && resolveOAuthRefreshToken()?.refreshToken);
}

function isServiceAccountConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_EMAIL?.trim() && process.env.GOOGLE_PRIVATE_KEY?.trim()
  );
}

/** @returns {'oauth' | 'oauth_pending' | 'service_account' | 'none'} */
export function getGoogleDriveAuthMode() {
  if (isOAuthConnected()) return "oauth";
  if (hasOAuthClientCredentials()) return "oauth_pending";
  if (isServiceAccountConfigured()) return "service_account";
  return "none";
}

/** True when uploads to personal My Drive (or Shared Drive via service account) can run. */
export function isGoogleDriveConfigured() {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  if (!folderId) return false;
  const mode = getGoogleDriveAuthMode();
  return mode === "oauth" || mode === "service_account";
}

/** Try to exchange the refresh token for an access token (catches invalid_grant). */
export async function verifyOAuthRefreshToken() {
  if (!isOAuthConnected()) {
    return {
      ok: false,
      error:
        "No refresh token. Open /api/google-drive/auth (saves to data/.google-oauth-token.json) " +
        "or set GOOGLE_OAUTH_REFRESH_TOKEN in .env.",
    };
  }
  try {
    const auth = getOAuth2Client();
    await auth.getAccessToken();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatDriveError(err) };
  }
}

export async function getGoogleDriveStatus() {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim() || null;
  const mode = getGoogleDriveAuthMode();
  const resolved = resolveOAuthRefreshToken();
  let oauthToken = null;
  if (mode === "oauth") {
    oauthToken = await verifyOAuthRefreshToken();
  }
  const oauthTokenValid = oauthToken?.ok === true;
  const oauthTokenError = oauthToken?.ok === false ? oauthToken.error : null;
  const renewal = getOAuthRenewalInfo(resolved?.obtainedAt ?? null);
  return {
    folderId,
    mode,
    ready: Boolean(
      folderId &&
        (mode === "service_account" || (mode === "oauth" && oauthTokenValid))
    ),
    oauthTokenValid: mode === "oauth" ? oauthTokenValid : null,
    oauthTokenError,
    oauthTokenSource: resolved?.source ?? null,
    oauthTokenObtainedAt: resolved?.obtainedAt ?? null,
    oauthTokenAgeDays: renewal.ageDays,
    daysUntilTestingExpiry: renewal.daysUntilTestingExpiry,
    needsRenewalSoon: renewal.needsRenewalSoon,
    oauthPublishingMode: getOAuthPublishingMode(),
    testingRefreshTokenLifetimeDays: isOAuthTestingMode() ? TESTING_REFRESH_TOKEN_LIFETIME_DAYS : null,
    testingRenewalNote: renewal.testingRenewalNote,
    connectUrl: "/api/google-drive/auth",
    usesPersonalGmail: mode === "oauth" || mode === "oauth_pending",
    dailyFolder: getDailyFolderName(),
    dailyFolderPattern: "Profile name / YYYY-MM-DD / resume.pdf",
    refreshTokenExpiryHint:
      mode === "oauth" && oauthTokenValid === false && oauthTokenError
        ? isOAuthTestingMode()
          ? `Testing OAuth: refresh tokens expire after ${TESTING_REFRESH_TOKEN_LIFETIME_DAYS} days. Re-connect at /api/google-drive/auth.`
          : "Refresh token invalid or revoked. Re-connect at /api/google-drive/auth (Production OAuth keeps long-lived tokens)."
        : renewal.needsRenewalSoon && oauthTokenValid
          ? renewal.testingRenewalNote
          : null,
  };
}

export function getOAuth2Client() {
  const client = createOAuth2Client();
  const refreshToken = resolveOAuthRefreshToken()?.refreshToken;
  if (refreshToken) {
    client.setCredentials({ refresh_token: refreshToken });
  }
  return client;
}

function getPrivateKey() {
  return process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
}

async function getDriveClient() {
  const mode = getGoogleDriveAuthMode();

  if (mode === "oauth") {
    const auth = getOAuth2Client();
    await auth.getAccessToken();
    return google.drive({ version: "v3", auth });
  }

  if (mode === "service_account") {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: getPrivateKey(),
      scopes: [DRIVE_SCOPE],
    });
    return google.drive({ version: "v3", auth });
  }

  if (mode === "oauth_pending") {
    throw new Error(`Google Drive not connected yet. ${CONNECT_HINT}`);
  }

  throw new Error(`Google Drive is not configured. ${CONNECT_HINT}`);
}

function formatDriveError(err) {
  const message = err?.message || String(err);
  if (/storage quota|shared drives|shared drive/i.test(message)) {
    return (
      `${message} Personal Gmail cannot use a service account on My Drive. ` +
      `Remove GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY and use OAuth instead. ${CONNECT_HINT}`
    );
  }
  if (/invalid_grant|token has been expired|revoked/i.test(message)) {
    return `${message} Re-connect at /api/google-drive/auth${isOAuthTestingMode() ? " (or publish OAuth app to Production)." : "."}`;
  }
  return message;
}

async function assertSharedDriveFolder(drive, folderId) {
  const { data } = await drive.files.get({
    fileId: folderId,
    fields: "id, name, mimeType, driveId",
    supportsAllDrives: true,
  });

  if (data.mimeType !== "application/vnd.google-apps.folder") {
    throw new Error(`GOOGLE_DRIVE_FOLDER_ID (${folderId}) is not a folder.`);
  }

  if (!data.driveId) {
    throw new Error(
      `That folder is in My Drive. Use OAuth (personal Gmail), not a service account. ${CONNECT_HINT}`
    );
  }
}

async function assertMyDriveFolder(drive, folderId) {
  const { data } = await drive.files.get({
    fileId: folderId,
    fields: "id, name, mimeType",
  });

  if (data.mimeType !== "application/vnd.google-apps.folder") {
    throw new Error(
      `GOOGLE_DRIVE_FOLDER_ID (${folderId}) is not a folder. Create a folder in My Drive and use its ID from the URL.`
    );
  }
}

/** YYYY-MM-DD subfolder name (optional GOOGLE_DRIVE_TIMEZONE, default UTC). */
export function getDailyFolderName(date = new Date()) {
  const timeZone = process.env.GOOGLE_DRIVE_TIMEZONE?.trim() || "UTC";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function escapeDriveQueryValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/** Safe folder label for Drive (keeps spaces; strips invalid path characters). */
export function sanitizeDriveFolderName(name) {
  const cleaned = String(name || "Profile")
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 100) || "Profile";
}

/** Find or create a child folder with the given name under parentFolderId. */
async function getOrCreateSubfolder(drive, parentFolderId, folderName, driveOpts) {
  const q = [
    "mimeType='application/vnd.google-apps.folder'",
    "trashed=false",
    `'${escapeDriveQueryValue(parentFolderId)}' in parents`,
    `name='${escapeDriveQueryValue(folderName)}'`,
  ].join(" and ");

  const existing = await drive.files.list({
    q,
    fields: "files(id)",
    pageSize: 1,
    ...driveOpts,
  });

  const foundId = existing.data.files?.[0]?.id;
  if (foundId) return foundId;

  const created = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
    ...driveOpts,
  });

  const folderId = created.data.id;
  if (!folderId) {
    throw new Error(`Could not create folder "${folderName}" in Google Drive.`);
  }
  return folderId;
}

/**
 * Upload a PDF to GOOGLE_DRIVE_FOLDER_ID / {profileName} / {YYYY-MM-DD} / fileName.
 * @param {Buffer} pdfBuffer
 * @param {string} fileName
 * @param {{ profileName?: string }} [options]
 */
export async function uploadPdfToGoogleDrive(pdfBuffer, fileName, { profileName } = {}) {
  if (!process.env.GOOGLE_DRIVE_FOLDER_ID?.trim()) {
    throw new Error("Set GOOGLE_DRIVE_FOLDER_ID to a folder in your My Drive.");
  }

  const mode = getGoogleDriveAuthMode();
  const drive = await getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID.trim();
  const body = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
  const useOAuth = mode === "oauth";
  const driveOpts = useOAuth ? {} : { supportsAllDrives: true };

  try {
    if (useOAuth) {
      await assertMyDriveFolder(drive, folderId);
    } else {
      await assertSharedDriveFolder(drive, folderId);
    }

    const profileFolderName = sanitizeDriveFolderName(profileName);
    const dayName = getDailyFolderName();
    const profileFolderId = await getOrCreateSubfolder(drive, folderId, profileFolderName, driveOpts);
    const uploadFolderId = await getOrCreateSubfolder(drive, profileFolderId, dayName, driveOpts);

    const created = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [uploadFolderId],
      },
      media: {
        mimeType: "application/pdf",
        body: Readable.from(body),
      },
      fields: "id",
      ...driveOpts,
    });

    const fileId = created.data.id;
    if (!fileId) {
      throw new Error("Google Drive upload failed: no file id returned");
    }

    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
      ...driveOpts,
    });

    const file = await drive.files.get({
      fileId,
      fields: "webViewLink",
      ...driveOpts,
    });

    const url = file.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
    return {
      fileId,
      url,
      profileFolder: profileFolderName,
      dayFolder: dayName,
      drivePath: `${profileFolderName}/${dayName}`,
    };
  } catch (err) {
    throw new Error(formatDriveError(err));
  }
}
