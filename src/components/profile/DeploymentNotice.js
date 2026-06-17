import { profileColors as colors } from "@/lib/theme-colors";

const aiEnabled = process.env.NEXT_PUBLIC_AI_GENERATE_ENABLED === "1";
const previewEnabled = process.env.NEXT_PUBLIC_PREVIEW_ENABLED === "1";
const manualEnabled = process.env.NEXT_PUBLIC_MANUAL_PDF_ENABLED === "1";

export function isAiGenerateEnabledClient() {
  return aiEnabled;
}

export function isPreviewEnabledClient() {
  return previewEnabled;
}

export function isManualPdfEnabledClient() {
  return manualEnabled;
}

export default function DeploymentNotice({ feature = "ai" }) {
  const enabled =
    feature === "ai" ? aiEnabled : feature === "manual" ? manualEnabled : previewEnabled;

  if (enabled) return null;

  const messages = {
    ai:
      "AI PDF generation is off on this Vercel deployment (saves Fluid CPU). Use Manual mode + Copy prompt, or run npm run dev locally. To re-enable: set ENABLE_VERCEL_AI=1 in Vercel env.",
    manual:
      "Manual PDF generation is off on this Vercel deployment (saves Fluid CPU). Copy prompt here, paste JSON from ChatGPT, then run npm run dev locally to build the PDF. To re-enable on Vercel: set ENABLE_VERCEL_MANUAL_PDF=1 in project env.",
    preview:
      "Template preview is off on this Vercel deployment. Run npm run dev locally, or set ENABLE_VERCEL_PREVIEW=1 in Vercel env.",
  };

  return (
    <p
      style={{
        margin: "0 0 12px",
        padding: "10px 12px",
        fontSize: "12px",
        lineHeight: 1.45,
        color: colors.infoText,
        background: colors.infoBg,
        border: `1px solid ${colors.infoText}`,
        borderRadius: "6px",
      }}
    >
      {messages[feature]}
    </p>
  );
}
