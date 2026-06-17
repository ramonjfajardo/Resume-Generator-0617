import DriveUrlCopy from "@/components/profile/DriveUrlCopy";

export default function GenerationFooter({
  disable,
  lastGenerationTime,
  driveUrl,
  driveFileName,
  driveError,
  colors,
}) {
  if (disable || !lastGenerationTime) return null;

  return (
    <div style={{ marginTop: "12px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          marginBottom: driveUrl || driveError ? "10px" : 0,
          fontSize: "12px",
          color: colors.successText,
        }}
      >
        <span aria-hidden>✓</span>
        <span>{lastGenerationTime}s</span>
      </div>
      {(driveUrl || driveError) && (
        <DriveUrlCopy
          url={driveUrl}
          fileName={driveFileName}
          error={driveError}
          colors={colors}
        />
      )}
    </div>
  );
}
