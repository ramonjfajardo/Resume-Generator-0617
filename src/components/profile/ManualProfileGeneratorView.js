import { useState, useEffect } from "react";
import { loadPdfDownload } from "@/lib/load-pdf-download";
import { useGenerationTimer } from "@/hooks/useGenerationTimer";
import { profileColors as colors } from "@/lib/theme-colors";
import ProfileModeSwitch from "@/components/profile/ProfileModeSwitch";
import GoogleDriveConnect from "@/components/profile/GoogleDriveConnect";
import GenerationFooter from "@/components/profile/GenerationFooter";
import FilenameFields from "@/components/profile/FilenameFields";
import { getProfileFormStyles } from "@/components/profile/profile-form-styles";
import { buildManualPrompt } from "@/lib/profile-prompt";
import DeploymentNotice, { isManualPdfEnabledClient } from "@/components/profile/DeploymentNotice";
import { extractJsonObjectString, parseResumeJsonString, validateResumeShape } from "@/lib/resume-json";

export default function ManualProfileGeneratorView({
  profileSlug,
  profileName,
  selectedProfileData,
}) {
  const [jd, setJd] = useState("");
  const [chatgptResponse, setChatgptResponse] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [disable, setDisable] = useState(false);
  const [lastGenerationTime, setLastGenerationTime] = useState(null);
  const [driveUrl, setDriveUrl] = useState(null);
  const [driveFileName, setDriveFileName] = useState(null);
  const [driveError, setDriveError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [generateError, setGenerateError] = useState(null);
  const { elapsedTime, start: startTimer, stop: stopTimer, finishElapsed } = useGenerationTimer();
  const styles = getProfileFormStyles(colors);
  const expectedJobCount = selectedProfileData?.experience?.length ?? 0;

  useEffect(() => {
    loadPdfDownload().catch(() => {});
  }, []);

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

  const promptTemplate = selectedProfileData?.promptTemplate;

  const copyPromptToClipboard = async () => {
    if (!jd.trim()) {
      alert("Please enter a job description first");
      return;
    }
    if (!promptTemplate) {
      alert("Prompt template not loaded. Refresh the page.");
      return;
    }
    try {
      const prompt = buildManualPrompt(selectedProfileData, jd, promptTemplate);
      await navigator.clipboard.writeText(prompt);
      setCopiedField("prompt");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      alert("Failed to copy prompt: " + err.message);
    }
  };

  const handleGenerate = async () => {
    if (!chatgptResponse.trim()) {
      alert("Paste the AI response (JSON) first");
      return;
    }

    const jsonStr = extractJsonObjectString(chatgptResponse.trim());
    const parsed = parseResumeJsonString(jsonStr);
    if (!parsed.ok) {
      alert(
        `Invalid JSON before PDF generation: ${parsed.error}. Ensure the pasted response is a complete JSON object and not a markdown block.`
      );
      return;
    }

    const shape = validateResumeShape(parsed.data, expectedJobCount);
    if (!shape.ok) {
      alert(
        `Invalid resume JSON shape: ${shape.reason}. Your profile expects ${expectedJobCount} experience entries with non-empty details.`
      );
      return;
    }

    setDisable(true);
    setLastGenerationTime(null);
    setDriveUrl(null);
    setDriveFileName(null);
    setDriveError(null);
    setGenerateError(null);
    startTimer();

    let formatFetchError = (e) => e?.message || "Unknown error";
    try {
      const pdfDownload = await loadPdfDownload();
      formatFetchError = pdfDownload.formatFetchError;
      const { fetchWithTimeout, downloadPdfFromResponse, MANUAL_GENERATE_TIMEOUT_MS } = pdfDownload;

      const response = await fetchWithTimeout(
        "/api/generate-manual",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: profileSlug,
            chatgptResponse: chatgptResponse.trim(),
            companyName: companyName.trim() || null,
            roleName: roleName.trim() || null,
          }),
        },
        MANUAL_GENERATE_TIMEOUT_MS
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
      setChatgptResponse("");
      setCompanyName("");
      setRoleName("");
    } catch (error) {
      console.error("Generation error:", error);
      stopTimer();
      const message = formatFetchError(error, { manual: true });
      setGenerateError(message);
      alert("Failed to generate PDF: " + message);
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
  ].filter((f) => f.value);

  const cardStyle = {
    background: colors.cardBg,
    borderRadius: "8px",
    border: `1px solid ${disable ? colors.infoText : colors.cardBorder}`,
    padding: "16px",
    transition: "border-color 0.2s ease",
  };

  const pillStyle = {
    marginLeft: "8px",
    padding: "2px 6px",
    fontSize: "10px",
    fontWeight: "600",
    color: colors.textMuted,
    background: colors.inputBg,
    borderRadius: "4px",
    textTransform: "none",
    letterSpacing: 0,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        padding: "16px",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ ...cardStyle, marginBottom: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: quickCopyFields.length ? "12px" : 0,
            }}
          >
            <h1 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>{profileName}</h1>
            <ProfileModeSwitch profileSlug={profileSlug} mode="manual" />
          </div>

          {quickCopyFields.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                gap: "6px",
                paddingTop: "10px",
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
                    padding: "6px 4px",
                    background: copiedField === key ? colors.copyBg : colors.inputBg,
                    border: `1px solid ${colors.inputBorder}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    minHeight: "48px",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>{icon}</span>
                  <div style={{ fontSize: "9px", color: colors.textMuted }}>
                    {copiedField === key ? "✓" : label}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <DeploymentNotice feature="manual" />
          <div style={{ marginBottom: "12px" }}>
            <label style={styles.label}>Job description</label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste job description…"
              rows={5}
              style={{ ...styles.textarea, minHeight: "100px" }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <button
              type="button"
              onClick={copyPromptToClipboard}
              disabled={!jd.trim() || !promptTemplate}
              style={{
                width: "100%",
                padding: "10px",
                fontWeight: 600,
                fontSize: "13px",
                color: colors.buttonText,
                background: !jd.trim() || !promptTemplate ? colors.buttonDisabled : colors.buttonBg,
                border: "none",
                borderRadius: "6px",
                cursor: !jd.trim() || !promptTemplate ? "not-allowed" : "pointer",
              }}
            >
              {copiedField === "prompt" ? "Copied" : "Copy prompt"}
            </button>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={styles.label}>
              AI response
              {expectedJobCount > 0 && <span style={pillStyle}>{expectedJobCount} jobs</span>}
            </label>
            <textarea
              value={chatgptResponse}
              onChange={(e) => setChatgptResponse(e.target.value)}
              placeholder='{"title":"…","summary":"…","skills":{},"experience":[]}'
              rows={8}
              style={{ ...styles.textarea, fontFamily: "monospace", fontSize: "12px" }}
            />
            {expectedJobCount > 0 && (
              <p style={{ marginTop: "8px", fontSize: "12px", color: colors.textMuted, lineHeight: 1.4 }}>
                Paste complete valid JSON with exactly {expectedJobCount} experience entries in the same order as the profile work history.
              </p>
            )}
          </div>

          <GoogleDriveConnect colors={colors} />

          <div style={{ marginBottom: "14px" }}>
            <FilenameFields
              idPrefix="manual-resume"
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
            disabled={disable || !chatgptResponse.trim() || !isManualPdfEnabledClient()}
            style={{
              width: "100%",
              padding: "11px",
              fontWeight: 600,
              fontSize: "14px",
              color: colors.buttonText,
              background:
                disable || !chatgptResponse.trim() || !isManualPdfEnabledClient()
                  ? colors.buttonDisabled
                  : colors.buttonBg,
              border: "none",
              borderRadius: "6px",
              cursor:
                disable || !chatgptResponse.trim() || !isManualPdfEnabledClient()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {disable ? `Building · ${elapsedTime}s` : "Generate PDF"}
          </button>

          {generateError && !disable && (
            <p style={{ marginTop: "10px", fontSize: "12px", color: "#ef4444", lineHeight: 1.4 }}>
              {generateError}
            </p>
          )}

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
