/** Shared field styles for profile generator views. */
export function getProfileFormStyles(colors) {
  const label = {
    display: "block",
    fontSize: "11px",
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: "6px",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  };

  const input = {
    width: "100%",
    padding: "8px 12px",
    fontSize: "13px",
    fontFamily: "inherit",
    color: colors.text,
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: "6px",
    boxSizing: "border-box",
  };

  const textarea = {
    ...input,
    background: colors.textareaBg,
    outline: "none",
    resize: "vertical",
  };

  const fieldLabel = {
    display: "block",
    fontSize: "12px",
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: "4px",
  };

  return { label, input, textarea, fieldLabel };
}
