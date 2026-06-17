import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { profileColors as colors } from "@/lib/theme-colors";

export default function Home() {
  const router = useRouter();
  const [profileSlug, setProfileSlug] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (profileSlug.trim()) {
      router.push(`/${profileSlug.trim()}`);
    }
  };

  return (
    <>
      <Head>
        <title>Resume Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          color: colors.text,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
          padding: "20px",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 20px" }}>
          <div
            style={{
              width: "100%",
              background: colors.cardBg,
              borderRadius: "12px",
              border: `1px solid ${colors.cardBorder}`,
              padding: "40px",
            }}
          >
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "600",
                color: colors.text,
                margin: "0 0 32px 0",
              }}
            >
              Resume Generator
            </h1>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "15px",
                    fontWeight: "400",
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
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    fontSize: "16px",
                    fontFamily: "inherit",
                    color: colors.text,
                    background: colors.inputBg,
                    border: `1px solid ${colors.inputBorder}`,
                    borderRadius: "8px",
                    outline: "none",
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
                  fontWeight: "500",
                  color: colors.buttonText,
                  background: profileSlug.trim() ? colors.buttonBg : colors.buttonDisabled,
                  border: "none",
                  borderRadius: "8px",
                  cursor: profileSlug.trim() ? "pointer" : "not-allowed",
                }}
              >
                Go to Profile
              </button>

              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: `1px solid ${colors.cardBorder}`,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <Link
                  href={profileSlug.trim() ? `/manual/${profileSlug.trim()}` : "/manual"}
                  prefetch
                  style={{
                    color: colors.linkColor,
                    fontSize: "14px",
                    textDecoration: "none",
                  }}
                >
                  No API key? Use Manual Resume (ChatGPT) →
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
