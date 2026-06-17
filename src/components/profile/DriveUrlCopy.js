import { useState } from "react";

export default function DriveUrlCopy({ url, fileName, error, colors }) {
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!url && !error) return null;

  if (error && !url) {
    const showConnect = error.includes("/api/google-drive/auth");
    return (
      <div
        style={{
          padding: "10px 12px",
          background: "rgba(234, 179, 8, 0.08)",
          border: "1px solid rgba(234, 179, 8, 0.4)",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#eab308",
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        Drive upload failed
        {showConnect && (
          <>
            {" · "}
            <a href="/api/google-drive/auth" style={{ color: "#eab308", fontWeight: 600 }}>
              Connect
            </a>
          </>
        )}
        {!showConnect && error.length < 120 ? `: ${error}` : null}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "stretch" }}>
      <input
        type="text"
        readOnly
        value={fileName || url}
        onFocus={(e) => e.target.select()}
        aria-label="Drive file name"
        style={{
          flex: 1,
          minWidth: 0,
          padding: "8px 10px",
          fontSize: "12px",
          fontFamily: "inherit",
          color: colors.text,
          background: colors.inputBg,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: "6px",
          boxSizing: "border-box",
        }}
      />
      <button
        type="button"
        onClick={copyUrl}
        style={{
          flexShrink: 0,
          padding: "8px 12px",
          fontSize: "12px",
          fontWeight: "600",
          color: colors.buttonText,
          background: copied ? colors.successText : colors.buttonBg,
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: "8px 10px",
          fontSize: "12px",
          fontWeight: "600",
          color: colors.linkColor,
          background: colors.inputBg,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: "6px",
          textDecoration: "none",
        }}
      >
        Open
      </a>
    </div>
  );
}
