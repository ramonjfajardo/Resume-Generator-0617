import { createOAuth2Client, hasOAuthClientCredentials } from "@/lib/google-drive";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

/**
 * GET — sign in with personal Gmail and get a refresh token for My Drive uploads.
 */
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  if (!hasOAuthClientCredentials()) {
    return res.status(400).send(
      "Add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to .env. " +
        "Create a Web application OAuth client in Google Cloud Console with redirect URI: " +
        "http://localhost:3000/api/google-drive/callback"
    );
  }

  const client = createOAuth2Client();
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  res.redirect(url);
}
