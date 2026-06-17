import fs from "fs";
import path from "path";

/** Only when GOOGLE_OAUTH_TESTING_MODE=true (Google Cloud consent screen in Testing). */
export const TESTING_REFRESH_TOKEN_LIFETIME_DAYS = 7;
export const RENEW_BEFORE_EXPIRY_DAYS = 5;

export function isOAuthTestingMode() {
  const v = process.env.GOOGLE_OAUTH_TESTING_MODE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function getOAuthPublishingMode() {
  return isOAuthTestingMode() ? "testing" : "production";
}

const TOKEN_FILE = path.join(process.cwd(), "data", ".google-oauth-token.json");

export function getOAuthTokenFilePath() {
  return TOKEN_FILE;
}

export function readStoredOAuthToken() {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
    const refreshToken = data?.refreshToken?.trim();
    if (!refreshToken) return null;
    return {
      refreshToken,
      obtainedAt: data.obtainedAt || null,
      source: "file",
    };
  } catch {
    return null;
  }
}

export function writeStoredOAuthToken(refreshToken) {
  const payload = {
    refreshToken: String(refreshToken).trim(),
    obtainedAt: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(payload, null, 2), "utf-8");
  return payload;
}

/** File store first (tracks issue date), then .env fallback. */
export function resolveOAuthRefreshToken() {
  const stored = readStoredOAuthToken();
  if (stored?.refreshToken) return stored;

  const fromEnv = process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();
  if (fromEnv) {
    return { refreshToken: fromEnv, obtainedAt: null, source: "env" };
  }
  return null;
}

export function getOAuthRenewalInfo(obtainedAt) {
  const testingMode = isOAuthTestingMode();

  if (!obtainedAt) {
    return {
      ageDays: null,
      daysUntilTestingExpiry: null,
      needsRenewalSoon: false,
      testingRenewalNote: testingMode
        ? "Testing-mode OAuth: refresh tokens expire after 7 days. Re-connect at /api/google-drive/auth every ~5 days."
        : null,
    };
  }

  const obtained = new Date(obtainedAt);
  if (Number.isNaN(obtained.getTime())) {
    return { ageDays: null, daysUntilTestingExpiry: null, needsRenewalSoon: false };
  }

  const ageDays = Math.floor((Date.now() - obtained.getTime()) / (24 * 60 * 60 * 1000));
  const daysUntilTestingExpiry = testingMode
    ? Math.max(0, TESTING_REFRESH_TOKEN_LIFETIME_DAYS - ageDays)
    : null;
  const needsRenewalSoon = testingMode && ageDays >= RENEW_BEFORE_EXPIRY_DAYS;

  return {
    ageDays,
    daysUntilTestingExpiry,
    needsRenewalSoon,
    testingRenewalNote:
      needsRenewalSoon
        ? `Refresh token is ${ageDays} day(s) old. Re-connect at /api/google-drive/auth before day ${TESTING_REFRESH_TOKEN_LIFETIME_DAYS} (Testing OAuth).`
        : null,
  };
}
