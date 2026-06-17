import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { profileColors as colors } from "@/lib/theme-colors";

export default function ManualIndex() {
  const router = useRouter();
  const [profileSlug, setProfileSlug] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (profileSlug.trim()) {
      router.push(`/manual/${profileSlug.trim()}`);
    }
  };

  return (
    <>
      <Head>
        <title>Manual Resume - No API Key</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          color: colors.text,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
          padding: "20px",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 20px" }}>
          <div
            style={{
              background: colors.cardBg,
              borderRadius: "12px",
              border: `1px solid ${colors.cardBorder}`,
              padding: "40px",
            }}
          >
            <h1 style={{ fontSize: "28px", fontWeight: 600, color: colors.text, margin: "0 0 16px" }}>
              Manual Resume Generator
            </h1>

            <p style={{ color: colors.textSecondary, marginBottom: "24px", fontSize: "15px", lineHeight: 1.6 }}>
              Create resumes using ChatGPT manually—no API key required. Enter your profile ID, copy the prompt to
              ChatGPT, paste the response back, and generate your PDF.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "15px",
                    color: colors.textSecondary,
                    marginBottom: "8px",
                  }}
                >
                  Enter Profile ID
                </label>
                <input
                  type="text"
                  value={profileSlug}
                  onChange={(e) => setProfileSlug(e.target.value)}
                  placeholder="e.g. er1, jd1, md1"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    fontSize: "16px",
                    color: colors.text,
                    background: colors.inputBg,
                    border: `1px solid ${colors.inputBorder}`,
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!profileSlug.trim()}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: colors.buttonText,
                  background: profileSlug.trim() ? colors.buttonBg : colors.buttonDisabled,
                  border: "none",
                  borderRadius: "8px",
                  cursor: profileSlug.trim() ? "pointer" : "not-allowed",
                }}
              >
                Go to Manual Resume
              </button>
            </form>

            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: `1px solid ${colors.cardBorder}` }}>
              <Link
                href={profileSlug.trim() ? `/${profileSlug.trim()}` : "/"}
                style={{ color: colors.linkColor, fontSize: "14px", textDecoration: "none" }}
              >
                ← Back to API Resume Generator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
