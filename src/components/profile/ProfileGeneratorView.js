import { useState } from "react";
import { loadPdfDownload } from "@/lib/load-pdf-download";
import { useGenerationTimer } from "@/hooks/useGenerationTimer";
import { profileColors as colors } from "@/lib/theme-colors";
import ProfileModeSwitch from "@/components/profile/ProfileModeSwitch";
import GoogleDriveConnect from "@/components/profile/GoogleDriveConnect";
import GenerationFooter from "@/components/profile/GenerationFooter";
import FilenameFields from "@/components/profile/FilenameFields";
import { getProfileFormStyles } from "@/components/profile/profile-form-styles";
import DeploymentNotice, { isAiGenerateEnabledClient } from "@/components/profile/DeploymentNotice";

export default function ProfileGeneratorView({
  profileSlug,
  profileName,
  selectedProfileData,
}) {
  const [jd, setJd] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [disable, setDisable] = useState(false);
  const [lastGenerationTime, setLastGenerationTime] = useState(null);
  const [driveUrl, setDriveUrl] = useState(null);
  const [driveFileName, setDriveFileName] = useState(null);
  const [driveError, setDriveError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const { elapsedTime, start: startTimer, stop: stopTimer, finishElapsed } = useGenerationTimer();
  const styles = getProfileFormStyles(colors);

  const copyToClipboard = async (text, fieldName) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const getLastCompany = () => selectedProfileData?.experience?.[0]?.company || null;
  const getLastRole = () => selectedProfileData?.experience?.[0]?.title || null;

  const handleGenerate = async () => {
    if (!jd.trim()) {
      alert("Please enter a job description");
      return;
    }

    setDisable(true);
    setLastGenerationTime(null);
    setDriveUrl(null);
    setDriveFileName(null);
    setDriveError(null);
    startTimer();

    let formatFetchError = (e) => e?.message || "Unknown error";
    try {
      const pdfDownload = await loadPdfDownload();
      formatFetchError = pdfDownload.formatFetchError;
      const { fetchWithTimeout, downloadPdfFromResponse, AI_GENERATE_TIMEOUT_MS } = pdfDownload;

      const response = await fetchWithTimeout(
        "/api/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: profileSlug,
            jd,
            companyName: companyName.trim() || null,
            roleName: roleName.trim() || null,
          }),
        },
        AI_GENERATE_TIMEOUT_MS
      );

      const fallbackFilename = `${profileName?.replace(/\s+/g, "_") || profileSlug}.pdf`;
      const { filename, driveUrl: url, driveError: uploadError } = await downloadPdfFromResponse(
        response,
        fallbackFilename
      );
      setDriveUrl(url);
      setDriveFileName(url ? filename : null);
      setDriveError(uploadError);
      setLastGenerationTime(finishElapsed());
      setJd("");
      setCompanyName("");
      setRoleName("");
    } catch (error) {
      console.error("Generation error:", error);
      stopTimer();
      alert("Failed to generate PDF: " + formatFetchError(error));
    } finally {
      setDisable(false);
      stopTimer();
    }
  };

  const quickCopyFields = [
    { key: "email", label: "Email", value: selectedProfileData.email, icon: "📧" },
    { key: "phone", label: "Phone", value: selectedProfileData.phone, icon: "📞" },
    {
      key: "address",
      label: "Address",
      value:
        typeof selectedProfileData.address === "string"
          ? selectedProfileData.address.trim()
          : selectedProfileData.address,
      icon: "🏠",
    },
    { key: "location", label: "Location", value: selectedProfileData.location, icon: "📍" },
    { key: "postalCode", label: "Postal", value: selectedProfileData.postalCode, icon: "✉️" },
    { key: "lastCompany", label: "Company", value: getLastCompany(), icon: "🏢" },
    { key: "lastRole", label: "Role", value: getLastRole(), icon: "💼" },
    { key: "linkedin", label: "LinkedIn", value: selectedProfileData.linkedin, icon: "🔗" },
    { key: "github", label: "GitHub", value: selectedProfileData.github, icon: "💻" },
  ].filter((field) => field.value);

  const cardStyle = {
    background: colors.cardBg,
    borderRadius: "8px",
    border: `1px solid ${disable ? colors.infoText : colors.cardBorder}`,
    padding: "16px",
    transition: "border-color 0.2s ease",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        padding: "16px",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ ...cardStyle, marginBottom: "12px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
              marginBottom: quickCopyFields.length ? "12px" : 0,
            }}
          >
            <div>
              <h1 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 2px 0" }}>{profileName}</h1>
              {selectedProfileData.title && (
                <p style={{ fontSize: "12px", color: colors.textSecondary, margin: 0 }}>
                  {selectedProfileData.title}
                </p>
              )}
            </div>
            <ProfileModeSwitch profileSlug={profileSlug} mode="api" />
          </div>

          {quickCopyFields.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                gap: "6px",
                paddingTop: "12px",
                borderTop: `1px solid ${colors.cardBorder}`,
              }}
            >
              {quickCopyFields.map(({ key, label, value, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => copyToClipboard(value, key)}
                  title={label}
                  style={{
                    padding: "8px 4px",
                    background: copiedField === key ? colors.copyBg : colors.inputBg,
                    border: `1px solid ${copiedField === key ? colors.infoText : colors.inputBorder}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    minHeight: "52px",
                  }}
                >
                  <span style={{ fontSize: "15px" }}>{icon}</span>
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 500,
                      color: copiedField === key ? colors.successText : colors.textMuted,
                    }}
                  >
                    {copiedField === key ? "✓" : label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <DeploymentNotice feature="ai" />
          <div style={{ marginBottom: "14px" }}>
            <label style={styles.label}>Job description</label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste job description…"
              rows={10}
              style={{ ...styles.textarea, minHeight: "160px" }}
            />
          </div>

          <GoogleDriveConnect colors={colors} />

          <div style={{ marginBottom: "14px" }}>
            <FilenameFields
              idPrefix="api-resume"
              companyName={companyName}
              roleName={roleName}
              onCompanyChange={setCompanyName}
              onRoleChange={setRoleName}
              colors={colors}
              styles={styles}
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={disable || !jd.trim() || !isAiGenerateEnabledClient()}
            style={{
              width: "100%",
              padding: "11px 16px",
              fontSize: "14px",
              fontWeight: "600",
              color: colors.buttonText,
              background:
                disable || !jd.trim() || !isAiGenerateEnabledClient()
                  ? colors.buttonDisabled
                  : colors.buttonBg,
              border: "none",
              borderRadius: "6px",
              cursor:
                disable || !jd.trim() || !isAiGenerateEnabledClient()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {disable ? `Generating · ${elapsedTime}s` : "Generate PDF"}
          </button>

          <GenerationFooter
            disable={disable}
            lastGenerationTime={lastGenerationTime}
            driveUrl={driveUrl}
            driveFileName={driveFileName}
            driveError={driveError}
            colors={colors}
          />
        </div>
      </div>
    </div>
  );
}
