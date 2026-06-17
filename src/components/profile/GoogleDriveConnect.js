import { useEffect, useState } from "react";

/** Minimal Drive connect prompt — only when sign-in is still needed. */
export default function GoogleDriveConnect({ colors }) {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetch("/api/google-drive/status")
      .then((r) => r.json())
      .then((s) => {
        if (s?.mode === "oauth_pending") {
          setBanner({ type: "connect", message: "Connect Google Drive to upload PDFs." });
        } else if (s?.mode === "oauth" && s?.oauthTokenValid === false) {
          setBanner({
            type: "reconnect",
            message:
              s.oauthTokenError ||
              s.refreshTokenExpiryHint ||
              "Google Drive token expired. Re-connect to get a new refresh token.",
          });
        } else if (s?.mode === "oauth" && s?.needsRenewalSoon) {
          setBanner({
            type: "renew",
            message:
              s.refreshTokenExpiryHint ||
              `Drive token is ${s.oauthTokenAgeDays} day(s) old. Re-connect before day ${s.testingRefreshTokenLifetimeDays} (Testing OAuth).`,
          });
        } else {
          setBanner(null);
        }
      })
      .catch(() => setBanner(null));
  }, []);

  if (!banner) return null;

  return (
    <a
      href="/api/google-drive/auth"
      style={{
        display: "inline-flex",
        alignItems: "center",
        marginBottom: "12px",
        padding: "6px 12px",
        fontSize: "12px",
        fontWeight: "500",
        color: colors.infoText,
        background: colors.infoBg,
        border: `1px solid ${colors.infoText}`,
        borderRadius: "6px",
        textDecoration: "none",
      }}
    >
      {banner.type === "reconnect"
        ? "Reconnect Drive"
        : banner.type === "renew"
          ? "Renew Drive (before 7 days)"
          : "Connect Drive"}
    </a>
  );
}
