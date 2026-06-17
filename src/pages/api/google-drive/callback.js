import { createOAuth2Client } from "@/lib/google-drive";
import {
  isOAuthTestingMode,
  writeStoredOAuthToken,
  TESTING_REFRESH_TOKEN_LIFETIME_DAYS,
} from "@/lib/google-oauth-store";

/**
 * GET — OAuth callback after signing in with personal Gmail.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const code = req.query.code;
  if (!code || typeof code !== "string") {
    return res.status(400).send("Missing authorization code. Open /api/google-drive/auth to try again.");
  }

  try {
    const client = createOAuth2Client();
    const { tokens } = await client.getToken(code);

    if (!tokens.refresh_token) {
      return res.status(400).send(
        "No refresh token returned. Revoke this app at https://myaccount.google.com/permissions " +
          "then open /api/google-drive/auth again."
      );
    }

    const saved = writeStoredOAuthToken(tokens.refresh_token);
    const testingMode = isOAuthTestingMode();
    const productionNote = testingMode
      ? `<p><strong>Testing-mode OAuth:</strong> refresh tokens expire after ~${TESTING_REFRESH_TOKEN_LIFETIME_DAYS} days. Re-open <a href="/api/google-drive/auth">/api/google-drive/auth</a> every ~5 days, or publish the app to <strong>Production</strong> and omit <code>GOOGLE_OAUTH_TESTING_MODE</code>.</p>`
      : `<p><strong>Production OAuth:</strong> this refresh token should stay valid until you revoke the app. Access tokens refresh automatically in the background.</p>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>My Drive connected</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 640px; margin: 40px auto; padding: 0 16px; line-height: 1.5;">
  <h1>Personal Gmail / My Drive connected</h1>
  <p><strong>Saved automatically</strong> to <code>data/.google-oauth-token.json</code> (obtained ${saved.obtainedAt}). Restart is not required.</p>
  <p>Optional — copy into <code>.env</code> as backup:</p>
  <pre style="background: #f1f5f9; padding: 16px; overflow-x: auto; border-radius: 8px; font-size: 13px;">GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}</pre>
  ${productionNote}
  <p><strong>GOOGLE_DRIVE_FOLDER_ID</strong> should be a folder in <strong>My Drive</strong> (open the folder in Drive and copy the ID from the URL).</p>
  <p>For deployed apps, set <code>GOOGLE_OAUTH_REDIRECT_URI</code> to your production callback URL (must match Google Cloud Console).</p>
  <p>You can remove <code>GOOGLE_CLIENT_EMAIL</code> and <code>GOOGLE_PRIVATE_KEY</code> — they are not used for personal Gmail.</p>
  <p><a href="/">Back to app</a></p>
</body>
</html>`);
  } catch (err) {
    console.error("[google-drive/callback]", err);
    res.status(500).send("OAuth failed: " + (err.message || String(err)));
  }
}
