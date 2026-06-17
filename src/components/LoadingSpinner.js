export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        gap: "12px",
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(74, 144, 226, 0.3)",
          borderTop: "3px solid #4a90e2",
          borderRadius: "50%",
          animation: "resume-spinner-spin 1s linear infinite",
        }}
        aria-hidden="true"
      />
      {label ? (
        <span style={{ fontSize: "13px", color: "#94a3b8" }}>{label}</span>
      ) : null}
      <style>{`
        @keyframes resume-spinner-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
