import Link from "next/link";
import { profileColors as colors } from "@/lib/theme-colors";

const linkStyle = {
  fontSize: "12px",
  fontWeight: "500",
  color: colors.infoText,
  textDecoration: "none",
  padding: "6px 10px",
  border: `1px solid ${colors.inputBorder}`,
  borderRadius: "6px",
  whiteSpace: "nowrap",
};

/**
 * @param {{ profileSlug: string, mode: "api" | "manual" }} props
 */
export default function ProfileModeSwitch({ profileSlug, mode }) {
  if (!profileSlug) return null;

  if (mode === "manual") {
    return (
      <Link href={`/${profileSlug}`} style={linkStyle}>
        API
      </Link>
    );
  }

  return (
    <Link href={`/manual/${profileSlug}`} style={linkStyle}>
      Manual
    </Link>
  );
}
